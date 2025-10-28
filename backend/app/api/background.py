import logging
from app.services.video_analysis_service import VideoAnalysisService

logger = logging.getLogger(__name__)


def analyse_video(video_public_id):

    logger.info(f"Analysing video with video_public_id {video_public_id}")

    video_analysis_service = VideoAnalysisService()

    # alert analysis
    logger.info(f"Checking for suspicions and alerts in video [{video_public_id}]")
    video_analysis_service.check_alert(video_public_id)

    # Per person analysis
    logger.info(f"Analysis People in video [{video_public_id}]")
    video_analysis_service.analyse_people_from_video(video_public_id)
