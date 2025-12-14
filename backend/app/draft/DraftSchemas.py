from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID
from enum import Enum

# Enums
class ContentCategory(str, Enum):
    NEWSLETTER = "newsletter"
    LINKEDIN_POST = "linkedin_post"
    YOUTUBE_SHORT = "youtube_short"
    INSTAGRAM_REEL = "instagram_reel"
    INSTAGRAM_POST = "instagram_post"
    INSTAGRAM_CAROUSEL = "instagram_carousel"
    INSTAGRAM_STORY = "instagram_story"
    COLD_EMAIL = "cold_email"
    COLD_DM = "cold_dm"
    BRAND_IDEA = "brand_idea"
    LEAD_GENERATION = "lead_generation"

class Platform(str, Enum):
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    EMAIL = "email"
    DM = "dm"
    INTERNAL = "internal"

class DraftStatus(str, Enum):
    DRAFT = "draft"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"

# Base Schema
class DraftBase(BaseModel):
    category: ContentCategory
    platform: Platform
    title: Optional[str] = Field(None, max_length=500)
    content: Dict[str, Any] = Field(..., description="Flexible content structure")
    metadata: Optional[Dict[str, Any]] = None
    tone: Optional[str] = Field(None, max_length=100)
    prompt_used: Optional[str] = None
    variation_id: Optional[str] = None
    model_used: Optional[str] = None
    rag_documents_used: Optional[List[str]] = None
    asset_urls: Optional[Dict[str, List[str]]] = None
    status: DraftStatus = DraftStatus.DRAFT
    notes: Optional[str] = None

# Create Schema
class DraftCreate(DraftBase):
    brand_id: UUID

# Update Schema
class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    tone: Optional[str] = None
    status: Optional[DraftStatus] = None
    notes: Optional[str] = None
    asset_urls: Optional[Dict[str, List[str]]] = None

# Response Schema
class DraftResponse(DraftBase):
    id: UUID
    brand_id: UUID
    generated_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class DraftListResponse(BaseModel):
    drafts: List[DraftResponse]
    total: int
    page: int
    page_size: int
    filters: Optional[Dict[str, Any]] = None

# Filter Schema
class DraftFilter(BaseModel):
    category: Optional[ContentCategory] = None
    platform: Optional[Platform] = None
    status: Optional[DraftStatus] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    search_query: Optional[str] = None