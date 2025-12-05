from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class PostingStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"

# Base Schema
class ScheduleBase(BaseModel):
    platform: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=100)
    content: Dict[str, Any] = Field(..., description="Content to be posted")
    assets: Optional[Dict[str, List[str]]] = None
    scheduled_date: datetime = Field(..., description="Date for posting")
    scheduled_time: datetime = Field(..., description="Time for posting")
    timezone: str = Field(default="UTC", max_length=50)
    posting_options: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    
    @field_validator('scheduled_date', 'scheduled_time')
    @classmethod
    def validate_future_datetime(cls, v):
        if v < datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        return v

# Create Schema
class ScheduleCreate(ScheduleBase):
    brand_id: UUID
    basket_id: Optional[UUID] = None
    draft_id: Optional[UUID] = None
    post_id: Optional[UUID] = None

# Create from Basket
class ScheduleCreateFromBasket(BaseModel):
    basket_id: UUID
    scheduled_date: datetime
    scheduled_time: datetime
    timezone: str = "UTC"
    posting_options: Optional[Dict[str, Any]] = None

# Update Schema
class ScheduleUpdate(BaseModel):
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[datetime] = None
    timezone: Optional[str] = None
    posting_options: Optional[Dict[str, Any]] = None
    posting_status: Optional[PostingStatus] = None
    notes: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    assets: Optional[Dict[str, List[str]]] = None

# Response Schema
class ScheduleResponse(ScheduleBase):
    id: UUID
    brand_id: UUID
    post_id: Optional[UUID] = None
    basket_id: Optional[UUID] = None
    draft_id: Optional[UUID] = None
    posting_status: PostingStatus
    attempt_count: int
    max_attempts: int
    error_message: Optional[str] = None
    error_details: Optional[Dict[str, Any]] = None
    last_attempt_at: Optional[datetime] = None
    published_url: Optional[str] = None
    platform_post_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    posted_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class ScheduleListResponse(BaseModel):
    schedules: List[ScheduleResponse]
    total: int
    page: int
    page_size: int

# Calendar View Response
class ScheduleCalendarDay(BaseModel):
    date: str
    schedules: List[ScheduleResponse]
    total_count: int

class ScheduleCalendarResponse(BaseModel):
    days: List[ScheduleCalendarDay]
    month: int
    year: int
    total_schedules: int

# Filter Schema
class ScheduleFilter(BaseModel):
    platform: Optional[str] = None
    posting_status: Optional[PostingStatus] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    category: Optional[str] = None