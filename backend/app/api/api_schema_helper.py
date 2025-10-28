from typing import List

import pydantic

class AlertResult(pydantic.BaseModel):
    start: str
    end: str
    alert_level: str
    description: str


class SopResult(pydantic.BaseModel):
    start: str
    end: str
    sop_event: str
    done: bool

class HUIDSOPResultsMap(pydantic.BaseModel):
    huid: str
    sop_results: List[SopResult]

class PersonAction(pydantic.BaseModel):
    start: str
    end: str
    action: str

class HUIDPersonActionsMap(pydantic.BaseModel):
    huid: str
    person_actions: List[PersonAction]

class PersonDetail(pydantic.BaseModel):
    name: str
    thumbnail: str
    video_ids: List[str]