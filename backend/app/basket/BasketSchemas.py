from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class BasketItemType(str, Enum):
    POST = "post"
    REEL = "reel"
    SHORT = "short"
    CAROUSEL = "carousel"
    STORY = "story"
    EMAIL = "email"
    DM = "dm"
    IDEA = "idea"

class BasketStatus(str, Enum):
    PENDING = "pending"
    READY = "ready"
    SCHEDULED = "scheduled"
    ARCHIVED = "archived"

# Base Schema
class BasketBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    platform: str = Field(..., min_length=1, max_length=50)
    item_type: BasketItemType
    title: Optional[str] = Field(None, max_length=500)
    content: Dict[str, Any] = Field(..., description="Content data")
    assets: Optional[Dict[str, List[str]]] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[datetime] = None
    scheduled_platform: Optional[str] = None
    posting_options: Optional[Dict[str, Any]] = None
    priority: int = Field(default=0, ge=0, le=10)
    status: BasketStatus = BasketStatus.PENDING

# Create Schema
class BasketCreate(BasketBase):
    brand_id: UUID
    draft_id: Optional[UUID] = None
    generation_id: Optional[UUID] = None

# Create from Draft
class BasketCreateFromDraft(BaseModel):
    draft_id: UUID
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    priority: int = 0

# Update Schema
class BasketUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    assets: Optional[Dict[str, List[str]]] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    scheduled_date: Optional[datetime] = None
    scheduled_time: Optional[datetime] = None
    scheduled_platform: Optional[str] = None
    posting_options: Optional[Dict[str, Any]] = None
    priority: Optional[int] = Field(None, ge=0, le=10)
    status: Optional[BasketStatus] = None

# Response Schema
class BasketResponse(BasketBase):
    id: UUID
    brand_id: UUID
    draft_id: Optional[UUID] = None
    generation_id: Optional[UUID] = None
    added_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class BasketListResponse(BaseModel):
    items: List[BasketResponse]
    total: int
    page: int
    page_size: int

# Filter Schema
class BasketFilter(BaseModel):
    item_type: Optional[BasketItemType] = None
    platform: Optional[str] = None
    status: Optional[BasketStatus] = None
    tags: Optional[List[str]] = None
    priority_min: Optional[int] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None