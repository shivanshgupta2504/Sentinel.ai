import json
from sqlite3 import Connection
import sqlite3
from typing import Annotated, List
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Body,
    Depends,
    HTTPException,
    Query,
    status,
)

from app.api import api_schema, api_schema_helper

from app.helpers import verify_sop

import logging

from app.api.background import analyse_video
from app.utils import build_local_uri_for_video, get_structured_output
from app.db import get_sqllite_db_connection
from app.exceptions import (
    AssetDownloadFailed,
    DBOperationFailed,
    GenericFSIOError,
)
from app.services.asset_management_service import AssetManagementService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")


@router.post(
    "/register_video",
    status_code=status.HTTP_200_OK,
    response_model=api_schema.RegisterVideoResponse,
)
def registerVideo(
    regVideoReq: api_schema.RegisterVideoRequest,
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
    background_tasks: BackgroundTasks,
):
    """
    Endpoint to register a video that the frontend has already uploaded to Cloudinary
    """

    try:
        file_path = build_local_uri_for_video(regVideoReq.video_public_id)
        asset_management_service = AssetManagementService()
        asset_management_service.download_asset_if_not_exist(
            file_path, regVideoReq.video_url
        )
        asset_management_service.register_asset(
            regVideoReq.video_public_id,
            regVideoReq.video_url,
            "video",
            db_conn,
            regVideoReq.env_id,
        )

        background_tasks.add_task(
            analyse_video, regVideoReq.video_public_id
        )

        return api_schema.RegisterVideoResponse(reg_status=True)

    except DBOperationFailed:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register the video",
        )

    except (GenericFSIOError, AssetDownloadFailed):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to download the video from given url",
        )


# may be only allow for memories ai
@router.post("/callback/alert_analysis")
def callbackAlert(
    video_public_id: Annotated[str, Query()],
    payload: Annotated[dict, Body()],
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
):

    if video_public_id == "":
        return

    try:
        logger.info(f"Alert callback for video_public_id - {video_public_id}")
        logger.info(f"Alert callback Text Payload {payload["data"]["text"]}")
        alert_resp = get_structured_output(payload["data"]["text"], "alert")
        logger.info(f"Structured Output for Alert {alert_resp}")

        cursor = db_conn.cursor()

        sql_cmd = """
        UPDATE videos
        SET alerts = ?
        WHERE public_id = ?
        """

        cursor.execute(sql_cmd,(json.dumps(alert_resp),video_public_id,))
        db_conn.commit()

        logger.info(f"Alert info updated successfully into db for video - {video_public_id}")

    except json.JSONDecodeError as e:
        logger.error(
            f"JSON Parsing of alert response failed, may be LLMs didn't structure data correctly"
        )

    except sqlite3.Error as e:
            logger.error(f"Failed to update alerts for video [{video_public_id}] due to error {e}")

            if db_conn:
                db_conn.rollback()

    except Exception as e:
        logger.error(f"Some unexpected failure occured , error : {e}")

    return

@router.post("/callback/huid_annotate")
def callbackHuidAnnotate(
    huid: Annotated[str, Query()],
    video_public_id: Annotated[str, Query()],
    payload: Annotated[dict, Body()],
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
):

    if video_public_id == "":
        return

    try:
        logger.info(f"HUID annotate callback for video_public_id - {video_public_id}")
        logger.info(f"HUID Annotate callback payload - {payload["data"]["text"]}")
        annotate_resp = get_structured_output(payload["data"]["text"], "annotate")
        logger.info(f"Structured Output for Annotate - {annotate_resp}")

        cursor = db_conn.cursor()

        sql_cmd = """
        INSERT INTO PEOPLE (huid, video_public_id, annotation)
        VALUES (?,?,?)
        """

        cursor.execute(sql_cmd,(huid,video_public_id,json.dumps(annotate_resp)))
        db_conn.commit()

        logger.info(f"Annotation info updated successfully into db for video - {video_public_id}")

        verify_sop(video_public_id,huid,db_conn)

    except json.JSONDecodeError as e:
        logger.error(
            f"JSON Parsing of alert response failed, may be LLMs didn't structure data correctly"
        )

    except sqlite3.Error as e:
            logger.error(f"Failed to update HUID Annotate and SOP Analysis for video [{video_public_id}] due to error {e}")

            if db_conn:
                db_conn.rollback()

    except Exception as e:
        logger.error(f"Some unexpected failure occured , error : {e}")

    return

@router.get(
    "/video_analysis/alerts",
    status_code=status.HTTP_200_OK,
    response_model=api_schema.VideoAnalysisAlertResponse,
)
def getVideoAnalysisAlert(
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
    videoAnalysisAlertReq: api_schema.VideoAnalysisAlertsRequest = Depends(),
    
):
    """
    Endpoint to get the alerts analysis results for a footage.
    """
    try:

        cursor = db_conn.cursor()

        sql_cmd = """
        SELECT alerts
        FROM videos
        WHERE public_id = ? AND alerts is NOT NULL
        """

        cursor.execute(sql_cmd,(videoAnalysisAlertReq.video_public_id,))
        res = cursor.fetchall()

        if(len(res) == 0):
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No Alerts found for the video"
            )
        
        res = res[0][0]
        res = json.loads(res)
        
        logger.info(f"Alert resp - {res}")
        res = api_schema.VideoAnalysisAlertResponse(alert_results=res)
        return res
        
    
    except sqlite3.Error as e:
        logger.error(f"Failed to get alerts for video [{videoAnalysisAlertReq.video_public_id}] due to error {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get alerts for the video"
        )


@router.get(
    "/video_analysis/sop",
    status_code=status.HTTP_200_OK,
    response_model=api_schema.VideoAnalysisSOPResponse,
)
def getVideoAnalysisSOP(
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
    videoAnalysisSopReq: api_schema.VideoAnalysisSOPRequest = Depends(),
):
    """
    Endpoint to get the SOP analysis results for a footage.
    """

    try:

        cursor = db_conn.cursor()

        sql_cmd = """
        SELECT huid,sop
        FROM people
        WHERE video_public_id = ? AND sop is NOT NULL
        """

        resp_list: List[api_schema_helper.HUIDSOPResultsMap] = []

        cursor.execute(sql_cmd,(videoAnalysisSopReq.video_public_id,))
        res = cursor.fetchall()

        if len(res) == 0:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No Analysis present yet"
            )

        for r in res:
            huid = r['huid']
            sop = json.loads(r['sop'])

            logger.info(f"HUID - {huid}, sop {sop}")

            resp_list.append(api_schema_helper.HUIDSOPResultsMap(huid=huid,sop_results=sop))

        return api_schema.VideoAnalysisSOPResponse(sop_results=resp_list)
        
    
    except sqlite3.Error as e:
        logger.error(f"Failed to get sop for video [{videoAnalysisSopReq.video_public_id}] due to error {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get per person sop for the video"
        )


@router.get(
    "/video_analysis/persons",
    status_code=status.HTTP_200_OK,
    response_model=api_schema.VideoAnalysisPersonsResponse,
)
def getVideoAnalysisPersons(
    db_conn: Annotated[Connection, Depends(get_sqllite_db_connection)],
    videoAnalysisPersonsReq: api_schema.VideoAnalysisPersonsRequest = Depends(),
):
    """
    Endpoint to get the per person analysis results for a footage.
    """

    try:

        cursor = db_conn.cursor()

        sql_cmd = """
        SELECT huid,annotation
        FROM people
        WHERE video_public_id = ? AND annotation is NOT NULL
        """

        resp_list: List[api_schema_helper.HUIDPersonActionsMap] = []

        cursor.execute(sql_cmd,(videoAnalysisPersonsReq.video_public_id,))
        res = cursor.fetchall()

        if len(res) == 0:
            raise HTTPException(
                status_code=status.HTTP_204_NO_CONTENT,
                detail="No Analysis present yet"
            )

        for r in res:
            huid = r['huid']
            annotation = json.loads(r['annotation'])

            logger.info(f"HUID - {huid}, Annotation {annotation}")

            resp_list.append(api_schema_helper.HUIDPersonActionsMap(huid=huid,person_actions=annotation))

        return api_schema.VideoAnalysisPersonsResponse(person_video_results=resp_list)
        
    
    except sqlite3.Error as e:
        logger.error(f"Failed to get annotation for video [{videoAnalysisPersonsReq.video_public_id}] due to error {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get per person annotation for the video"
        )


@router.get(
    "/persons",
    status_code=status.HTTP_200_OK,
    response_model=api_schema.PersonDetailResponse,
)
def getPersonDetail(personDetailRequest: api_schema.PersonDetailRequest):
    """
    Endpoint to get the detail of a given person.
    """
    pass
