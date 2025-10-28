from typing import List

import pydantic

from app.api.api_schema_helper import HUIDSOPResultsMap, HUIDPersonActionsMap, PersonDetail, AlertResult

class RegisterVideoRequest(pydantic.BaseModel):
    video_public_id: str
    video_url: str
    env_id: int

class RegisterVideoResponse(pydantic.BaseModel):
    reg_status: bool

class VideoAnalysisAlertsRequest(pydantic.BaseModel):
    video_public_id: str

class VideoAnalysisAlertResponse(pydantic.BaseModel):
    alert_results : List[AlertResult]

class VideoAnalysisSOPRequest(pydantic.BaseModel):
    video_public_id: str # technically don't need video_id, since we will be running SOP per day, its analytics

class VideoAnalysisSOPResponse(pydantic.BaseModel):
    sop_results: List[HUIDSOPResultsMap]

class VideoAnalysisPersonsRequest(pydantic.BaseModel):
    video_public_id: str

class VideoAnalysisPersonsResponse(pydantic.BaseModel):
    person_video_results: List[HUIDPersonActionsMap]

class PersonDetailRequest(pydantic.BaseModel):
    huid: str

class PersonDetailResponse(pydantic.BaseModel):
    person_details: PersonDetail
