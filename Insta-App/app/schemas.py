# app/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class MediaCreate(BaseModel):
    url: str
    mime_type: Optional[str] = None
    brand_post_id: Optional[str] = None

class MediaOut(MediaCreate):
    id: int

class ScheduleCreate(BaseModel):
    account_username: str
    caption: Optional[str] = ""
    type: str  # post|reel|story|carousel
    media_ids: List[int] = []
    scheduled_at: datetime
    brand_post_id: Optional[str] = None

class ScheduleOut(BaseModel):
    id: int
    status: str
    scheduled_at: datetime
