from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID

# Base Schema
class BrandBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    tagline: Optional[str] = Field(None, max_length=500)
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    
    # Voice & Tone
    voice_profile: Optional[Dict[str, Any]] = None
    tone_attributes: Optional[Dict[str, int]] = None
    language_preferences: Optional[Dict[str, Any]] = None
    
    # Visual Identity
    color_palette: Optional[Dict[str, str]] = None
    logo_url: Optional[str] = None
    fonts: Optional[Dict[str, str]] = None
    
    # Target Audience
    target_audience: Optional[Dict[str, Any]] = None
    buyer_personas: Optional[List[Dict[str, Any]]] = None
    
    # Industry & Positioning
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    positioning_statement: Optional[str] = None
    unique_value_proposition: Optional[str] = None
    competitors: Optional[List[Dict[str, Any]]] = None
    
    # Social Media
    social_handles: Optional[Dict[str, str]] = None
    
    # Content Strategy
    content_pillars: Optional[List[str]] = None
    hashtag_sets: Optional[Dict[str, List[str]]] = None
    posting_schedule: Optional[Dict[str, Any]] = None
    
    is_active: bool = True

# Create Schema
class BrandCreate(BrandBase):
    pass

# Update Schema
class BrandUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    tagline: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    values: Optional[List[str]] = None
    voice_profile: Optional[Dict[str, Any]] = None
    tone_attributes: Optional[Dict[str, int]] = None
    language_preferences: Optional[Dict[str, Any]] = None
    color_palette: Optional[Dict[str, str]] = None
    logo_url: Optional[str] = None
    fonts: Optional[Dict[str, str]] = None
    target_audience: Optional[Dict[str, Any]] = None
    buyer_personas: Optional[List[Dict[str, Any]]] = None
    industry: Optional[str] = None
    sub_industry: Optional[str] = None
    positioning_statement: Optional[str] = None
    unique_value_proposition: Optional[str] = None
    competitors: Optional[List[Dict[str, Any]]] = None
    social_handles: Optional[Dict[str, str]] = None
    content_pillars: Optional[List[str]] = None
    hashtag_sets: Optional[Dict[str, List[str]]] = None
    posting_schedule: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

# Response Schema
class BrandResponse(BrandBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class BrandListResponse(BaseModel):
    brands: List[BrandResponse]
    total: int
    page: int
    page_size: int