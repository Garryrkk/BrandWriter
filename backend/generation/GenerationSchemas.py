from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID

# Base Schema
class GenerationBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    platform: Optional[str] = Field(None, max_length=50)
    prompt: str = Field(..., min_length=1)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=1, le=4096)
    rag_enabled: bool = False
    rag_query: Optional[str] = None
    tone: Optional[str] = None
    style_attributes: Optional[Dict[str, Any]] = None

# Create Schema (Request)
class GenerationCreate(GenerationBase):
    brand_id: UUID
    variations_count: int = Field(default=3, ge=1, le=10)

# Quick Generate Request
class QuickGenerateRequest(BaseModel):
    brand_id: UUID
    category: str
    platform: Optional[str] = None
    custom_prompt: Optional[str] = None
    rag_enabled: bool = True
    variations_count: int = 3

# Batch Generate Request
class BatchGenerateRequest(BaseModel):
    brand_id: UUID
    categories: List[str] = Field(..., min_items=1)
    count_per_category: int = Field(default=10, ge=1, le=100)
    rag_enabled: bool = True

# Response Schema
class GenerationResponse(GenerationBase):
    id: UUID
    brand_id: UUID
    model_used: str
    output: Dict[str, Any]
    variations: Optional[List[Dict[str, Any]]] = None
    selected_variation: Optional[int] = None
    rag_documents_used: Optional[List[str]] = None
    rag_context: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    quality_score: Optional[float] = None
    token_count: Optional[int] = None
    generation_time: Optional[float] = None
    user_rating: Optional[int] = None
    user_feedback: Optional[str] = None
    was_used: bool
    batch_id: Optional[UUID] = None
    is_auto_generated: bool
    draft_id: Optional[UUID] = None
    basket_id: Optional[UUID] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class GenerationListResponse(BaseModel):
    generations: List[GenerationResponse]
    total: int
    page: int
    page_size: int

# Batch Response
class BatchGenerationResponse(BaseModel):
    batch_id: UUID
    brand_id: UUID
    total_generated: int
    generations_by_category: Dict[str, int]
    status: str
    started_at: datetime
    completed_at: Optional[datetime] = None

# User Feedback Schema
class GenerationFeedback(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
    was_used: bool = False

# Filter Schema
class GenerationFilter(BaseModel):
    category: Optional[str] = None
    platform: Optional[str] = None
    is_auto_generated: Optional[bool] = None
    was_used: Optional[bool] = None
    batch_id: Optional[UUID] = None
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
    min_rating: Optional[int] = None