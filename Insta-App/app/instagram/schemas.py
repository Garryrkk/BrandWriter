from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class InstagramPostRequest(BaseModel):
    platform: str = "instagram"
    post_type: str  # post | carousel | reel | story
    caption: str
    media_urls: List[str]
    scheduled_at: Optional[datetime] = None
    metadata: dict


class InstagramPostResponse(BaseModel):
    status: str
    instagram_post_id: Optional[str] = None
    posted_at: Optional[datetime] = None
    error: Optional[str] = None
