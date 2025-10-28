import logging
import os
from pathlib import Path
import sqlite3

import cloudinary.uploader
import requests

from app.constants import Environment
from app.exceptions import AssetDownloadFailed, DBOperationFailed, GenericFSIOError, UploadFailed, UploadingUnsupportedResourceType

logger = logging.getLogger(__name__)

class AssetManagementService:

    asset_folder = {
        "image" : "sentinel_images",
        "video" : "sentinel_videos"
    }

    supported_resource_types = ['image', 'video']


    def _associate_video_with_env(self,video_public_id, env_id, cursor):
            
        env = Environment(env_id)
    
        sql_cmd = f"""
        UPDATE videos
        set env_id = ? 
        WHERE public_id = ?
        """
        
        cursor.execute(sql_cmd, (env_id, video_public_id,))

        logger.info(f"Successfully associated video_public_id: {video_public_id} with {env.name} Environment")


    def upload_asset(self, file_uri, resource_type):
        """
        Upload image or video file to cloudinary and return (public_id,secure_url) of the uploaded file
        """

        if resource_type not in self.supported_resource_types:
            raise UploadingUnsupportedResourceType()
        
        try:
            resp = cloudinary.uploader.upload(
                file_uri,
                asset_folder=self.asset_folder[resource_type],
                resource_type=resource_type
            )

            return resp['public_id'], resp['secure_url']
        except:
            raise UploadFailed()
        
    def register_asset(self,file_public_id, file_url, resource_type, db_conn, env_id = None):
        """
        Register Uploaded asset into DB
        """

        table_name = ""

        if resource_type not in self.supported_resource_types:
            raise UploadingUnsupportedResourceType()
        
        if resource_type == "image":
            table_name = "images"
        elif resource_type == "video":
            table_name = "videos"

        try:
            cursor = db_conn.cursor()

            sql_cmd = f"""
            INSERT INTO {table_name} (public_id, url) 
            VALUES (?, ?)
            """

            cursor.execute(sql_cmd, (file_public_id, file_url,))

            logger.info(f"Successfully inserted {resource_type} with public_id: {file_public_id}")

            if(env_id != None and resource_type == "video"):
                self._associate_video_with_env(file_public_id,env_id,cursor)

            db_conn.commit()

        except sqlite3.Error as e:

            logger.error(f"Failed to register {resource_type} with public_id : {file_public_id}, Failed to insert into table {table_name} due to error {e}")

            if db_conn:
                db_conn.rollback()

            raise DBOperationFailed()
        
    def download_asset_if_not_exist(self, file_path, url):

        file = Path(file_path)

        try:
            os.makedirs(file.parent.resolve(), exist_ok=True)
        except Exception as e:
            logger.error(f"Failed to create download path for asset from {url} due to error {e}")
            raise GenericFSIOError()

        if(file.exists()):
            return

        try:
            logger.info(f"Downloading asset from {url}")
            with requests.get(url,stream=True) as r:
                r.raise_for_status()
                with open (file_path,'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            logger.info(f"Successfully downloaded asset from {url}")

        except Exception as e:
            logger.error(f"Failed to download asset from {url} due to error {e}")
            raise AssetDownloadFailed()
        
    def get_downloadable_cloudinary_url(self,public_id,resource_type):

        if resource_type not in self.supported_resource_types:
            raise UploadingUnsupportedResourceType()
        
        return cloudinary.utils.cloudinary_url(public_id,resource_type=resource_type,transformation=[
            {'flags': 'attachment'}
        ])[0]
