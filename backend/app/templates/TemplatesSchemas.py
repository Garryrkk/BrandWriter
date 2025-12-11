from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.templates.TemplatesModels import ContentCategory, Platform


class TemplateSection(BaseModel):
    name: str
    max_chars: int
    required: bool = True
    description: Optional[str] = None


class TemplateFormatting(BaseModel):
    hashtags: str = "auto"  # auto, manual, none
    emoji_usage: str = "medium"  # none, low, medium, high
    paragraph_spacing: bool = True
    line_breaks: bool = True


class TemplateStructure(BaseModel):
    sections: List[TemplateSection]
    formatting: TemplateFormatting


class TemplateCreate(BaseModel):
    category: ContentCategory
    platform: Platform
    name: str = Field(..., min_length=3, max_length=255)
    structure: Dict[str, Any]  # Will be validated as TemplateStructure
    prompt: str = Field(..., min_length=50)
    recommended_length: Optional[int] = None
    tone: Optional[str] = None
    active: bool = True


class TemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=255)
    structure: Optional[Dict[str, Any]] = None
    prompt: Optional[str] = Field(None, min_length=50)
    recommended_length: Optional[int] = None
    tone: Optional[str] = None
    active: Optional[bool] = None


class TemplateResponse(BaseModel):
    id: UUID
    category: ContentCategory
    platform: Platform
    name: str
    structure: Dict[str, Any]
    prompt: str
    recommended_length: Optional[int]
    tone: Optional[str]
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateListResponse(BaseModel):
    items: List[TemplateResponse]
    total: int
    page: int
    page_size: int


class TemplateFilter(BaseModel):
    category: Optional[ContentCategory] = None
    platform: Optional[Platform] = None
    active: Optional[bool] = None
    search: Optional[str] = None