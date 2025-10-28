import json
import logging
from sqlite3 import Connection

from app.utils import get_structured_output

logger = logging.getLogger(__name__)

def verify_sop(video_public_id, huid, db_conn:  Connection):

    # The below design is for hackathon only, but ideally in general we will every day once run all SOP for that store for each person at the end of the day


    # fetch env, sop, annotation of huid for video, and ask LLM to verify

    cursor = db_conn.cursor()

    get_env_id_cmd = """
    SELECT sop_checks, annotation
    FROM videos
    JOIN sopdefs ON videos.env_id = sopdefs.env_id 
    JOIN people ON people.video_public_id = videos.public_id
    where public_id = ? and huid = ? 
    """

    cursor.execute(get_env_id_cmd,(video_public_id,huid))
    results = cursor.fetchall()

    if(len(results) == 0):
        logger.error(f"Unexpected Failure Failed to get env for video - [{video_public_id}]")
        return

    # verify_sops
    sop_checks, annotation = results[0]['sop_checks'], json.loads(results[0]['annotation'])

    sop_resp = get_structured_output(annotation,"sop",sop_checks)

    logger.info(f"SOP Resp - {sop_resp}")

    if sop_resp is not None and sop_resp != '':

        update_sop_cmd = """
        UPDATE people
        set sop = ?
        where video_public_id = ? AND huid = ?
        """ 
        cursor.execute(update_sop_cmd,(json.dumps(sop_resp),video_public_id,huid))

    db_conn.commit()