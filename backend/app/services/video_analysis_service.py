import logging
import os
from typing import Dict, Set
import uuid

import cv2
import numpy as np
import requests

from ultralytics import YOLO

from app.config import APP_ROOT_DIR, osnet_feature_extractor, huid_collection
from app.utils import (
    build_local_uri_for_video,
    build_uri_for_crop,
    build_uri_for_huid,
    generate_unique_id,
    select_most_diverse_subset,
    store_crop_at_path,
)

from chromadb.errors import ChromaError

from app.services.asset_management_service import AssetManagementService

logger = logging.getLogger(__name__)


class VideoAnalysisService:

    def __init__(self):
        # not the most efficient way, but should be fine for now
        self.segmentation_model = YOLO(f"{APP_ROOT_DIR}/models/yolo11n.pt")
        self.base_url = "https://20da56df2fe66e.lhr.life"

    def _select_best_local_crop_for_huid(self,huid: str):
        """
            Using res as heuristic for getting best image, should work fairly well for now
        """

        best_res = 0
        best_res_file_path = ""

        huid_folder = build_uri_for_huid(huid,"huid_crops")

        for filename in os.listdir(huid_folder):
            file_path = os.path.join(huid_folder, filename)

            try:
                img = cv2.imread(file_path)

                if img is not None:
                    # img.shape is (height, width, channels)
                    height, width = img.shape[:2]
                    
                    current_res = width * height

                    # Check if this image has more pixels than the current max
                    if current_res > best_res:
                        best_res = current_res
                        best_res_file_path = file_path
        
            except Exception as e:
                # Catch other potential OS errors (like permission denied)
                logger.error(f"Could not process file {file_path} due to error {e}")

        return best_res_file_path

    def _get_next_frame_from_video(self,video_file_path):

        if not os.path.exists(video_file_path):
            raise FileNotFoundError(f"Video file not found: {video_file_path}")

        video_capture = cv2.VideoCapture(video_file_path)

        if not video_capture.isOpened():
            raise IOError(f"Error: Could not open video file {video_file_path}")

        try:
            while True:
                ret, frame = video_capture.read()

                if not ret:
                    break

                yield frame
        finally:
            video_capture.release()

    def _get_crops_and_trackid_from_frame(self, frame, threshold_conf):

        crops = []

        if frame is None:
            raise ValueError("Input frame is None")

        # can use streaming mode later for better performance

        results = self.segmentation_model.track(
            frame,
            tracker=f"{APP_ROOT_DIR}/models/botsort_tracker_config.yaml",
            conf=threshold_conf,
            persist=True,
            classes=[0],
            device=0,
            verbose=False,
        )

        if results[0].boxes.id is None:
            return [], []

        boxes = results[0].boxes.xyxy.cpu().numpy().astype(int)
        track_ids = results[0].boxes.id.cpu().numpy().astype(int)

        for box in boxes:
            x1, y1, x2, y2 = box
            crops.append(frame[y1:y2, x1:x2])

            # ToDo -> one more thing we can do is use a segmentation mask to get the object more precisely, segmentation mask will be black out everything except the object

        return crops, track_ids

    def _get_hu_obj_from_crop_from_db(self, crop, top_k):

        if top_k <= 0:
            raise ValueError("top_k should be greater than 0")

        results = huid_collection.query(
            query_embeddings=[osnet_feature_extractor(crop)[0].cpu().numpy()],
            n_results=top_k,
            include=["uris", "metadatas", "distances"],
        )

        return results["metadatas"][0], results["distances"][0]

    def _insert_huid_crop_to_db(self, crop, huid=None, id=None):

        if huid is None:
            huid = str(uuid.uuid4())

        if id is None:
            id = generate_unique_id()

        uri = build_uri_for_crop(huid, id, "huid_crops")

        huid_collection.add(
            ids=[id],
            embeddings=[osnet_feature_extractor(crop)[0].cpu().numpy()],
            metadatas={"huid": huid},
            uris=[uri],
        )

        store_crop_at_path(crop, uri)
        return huid

    def _upsert_crop_to_gallery_in_db_if_novel(self, huid, crop):

        # query chromadb to get existing objects for this huid
        results = huid_collection.get(
            where={"huid": huid},
            include=["uris", "metadatas", "embeddings"],
        )

        ids = results["ids"]
        embeddings = results["embeddings"]

        if len(ids) == 0:
            raise ValueError(f"No existing entries found for huid: {huid}")

        # ToDo -> Instead of just adding the new crop directly see if its not too similar to existing ones, even if we don't have 5 crops yet

        if len(ids) < 5:
            self._insert_huid_crop_to_db(crop, huid)
            return

        new_id = generate_unique_id()
        new_embedding = osnet_feature_extractor(crop)[0].cpu().numpy()

        all_ids = ids + [new_id]
        all_embeddings = np.vstack([embeddings, new_embedding])

        diverse_indices = select_most_diverse_subset(all_embeddings, 5)

        original_ids_set = set(ids)
        diverse_ids_set = set([all_ids[i] for i in diverse_indices])

        ids_to_delete = list(original_ids_set - diverse_ids_set)

        if len(ids_to_delete) > 0:
            huid_collection.delete(ids=ids_to_delete)

        for id in ids_to_delete:
            uri = build_uri_for_crop(huid, id, "huid_crops")
            trash_uri = build_uri_for_crop(huid, id, "trash_crops")

            if os.path.exists(uri):
                os.rename(uri, trash_uri)

        for id in diverse_ids_set:
            if id == new_id:
                self._insert_huid_crop_to_db(crop, huid, new_id)

    def _get_and_insert_huids_from_video(self, video_path):

        try:

            current_trackids: Set[int] = set()
            current_huids: Set[int] = set()
            trackid_to_huid: Dict[int, int] = dict()
            huid_to_trackids: Dict[int, Set[int]] = dict()

            for step, frame in enumerate(self._get_next_frame_from_video(video_path)):
                crops, trackids = self._get_crops_and_trackid_from_frame(
                    frame, threshold_conf=0.7
                )

                for crop, trackid in zip(crops, trackids):

                    # new trackid
                    if trackid not in current_trackids:
                        current_trackids.add(trackid)

                        metadata, distances = self._get_hu_obj_from_crop_from_db(
                            crop, top_k=1
                        )

                        if len(metadata) != 0 and distances[0] < 0.3:
                            huid = metadata[0]["huid"]
                            distance = distances[0]
                        else:
                            huid = self._insert_huid_crop_to_db(crop)

                        # face not seen in this video yet
                        if huid not in current_huids:
                            current_huids.add(huid)

                        trackid_to_huid[trackid] = huid
                        huid_to_trackids.setdefault(huid, set()).add(trackid)
                    else:
                        huid = trackid_to_huid[trackid]

                    if step % 10 == 0:
                        self._upsert_crop_to_gallery_in_db_if_novel(huid, crop)

            return current_huids

        except (FileNotFoundError,IOError) as e:
            logger.error(f"Some IO Error occured [{e}] while processing video {video_path}")
        except ValueError as e:
            logger.error(f"Internal Error occured [{e}] while processing video {video_path}")
        except ChromaError as e:
            logger.error(f"Unexpected Failure on Chroma DB , error [{e}] while processing video {video_path}")
        except Exception as e:
            logger.error(f"Internal Failure, Error [{e}] while processing video {video_path}")


    def check_alert(self, video_public_id):

        url = "https://security.memories.ai/v1/understand/upload"
        headers = {"Authorization": "sk-c8edcd8a5c1f63fd7fb0c11d752ec559"}

        alert_prompt = """
        Log every suspicious/malicious activity, with both start and end timestamps with alert levels - Warning, High, Critical and description of the event.
        """

        video_url = AssetManagementService().get_downloadable_cloudinary_url(video_public_id,"video")

        data = {
            "video_url": video_url,
            "user_prompt": alert_prompt,
            "system_prompt": "You are an Threat analysis System.",
            "callback": f"{self.base_url}/api/v1/callback/alert_analysis?video_public_id={video_public_id}",  # Needs to change
            "thinking": True
        }

        try:
            logger.info(f"Sending Caption API request for alert analysis for video [{video_public_id}]")
            response = requests.post(url, json=data, headers=headers)
            resp = response.json()
            msg = resp.get("msg", "")
            if msg == "success":
                logger.info(f"Caption API request for alert analysis for video [{video_public_id}] succeeded")
                return True
            else:
                logger.error(f"Caption API request for alert analysis for video [{video_public_id}]  failed with error msg {msg}")
                return False
        except requests.exceptions.RequestException as e:
            logger.error(f"check_alert() failed with error {e} for video_id {video_public_id}")
            return False
        
    def annotate_human(self,video_public_id: str, video_url: str, huid: str, img_url: str) -> bool:

        url = "https://security.memories.ai/v1/understand/upload"
        headers = {"Authorization": "sk-c8edcd8a5c1f63fd7fb0c11d752ec559"}

        user_prompt_for_reid = """
        Log every major actions for/with Robin with both start and end timestamps.
        """

        persons = [
            {"name": "Robin", "url": img_url},
        ]

        data = {
            "video_url": video_url,
            "user_prompt": user_prompt_for_reid,
            "system_prompt": "You are an image analysis system with human re-identification capabilities.",
            "callback": f"{self.base_url}/api/v1/callback/huid_annotate?huid={huid}&video_public_id={video_public_id}", # Needs to change
            "persons": persons,
            "thinking": True
        }

        try:
            logger.info(f"Sending Caption API request for human analysis for video [{video_public_id}]")
            response = requests.post(url, json=data, headers=headers)
            resp = response.json()
            msg = resp.get("msg", "")
            if msg == "success":
                logger.info(f"Caption API request for human analysis for video [{video_public_id}] succeeded")
                return True
            else:
                logger.error(f"Caption API request for human analysis for video [{video_public_id}]  failed with error msg {msg}")
                return False
            
        except requests.exceptions.RequestException as e:
            logger.error(f"annotatehuman() failed with error {e} for video [{video_public_id}]")
            return False


    def analyse_people_from_video(self, video_public_id):

        video_file_path = build_local_uri_for_video(video_public_id)

        logger.info(f"Extracting Crops and HUID from the video {video_file_path}")

        huids = self._get_and_insert_huids_from_video(video_file_path)

        logger.info(f"Their are {len(huids)} unique people in video [{video_file_path}]")

        asset_mgmt_service = AssetManagementService()
        downloadable_video_url = asset_mgmt_service.get_downloadable_cloudinary_url(video_public_id,"video")

        for huid in huids:
            local_uri = self._select_best_local_crop_for_huid(huid)
            public_id, url = asset_mgmt_service.upload_asset(local_uri,"image")
            downloadable_img_url = asset_mgmt_service.get_downloadable_cloudinary_url(public_id, "image")

            self.annotate_human(video_public_id,downloadable_video_url,huid,downloadable_img_url)
