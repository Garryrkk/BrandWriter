from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, List, Any
from datetime import datetime
from uuid import UUID

# Variable Definition Schema
class TemplateVariable(BaseModel):
    name: str = Field(..., description="Variable name (e.g., 'product_name')")
    type: str = Field(default="string", description="Variable type: string, number, boolean, array")
    required: bool = Field(default=False)
    default: Optional[Any] = None
    description: Optional[str] = None
    options: Optional[List[Any]] = None  # For dropdown/select variables
    validation: Optional[Dict[str, Any]] = None  # Custom validation rules

# Example Schema
class TemplateExample(BaseModel):
    input: Dict[str, Any]
    output: str
    description: Optional[str] = None

# Base Schema
class TemplateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., min_length=1, max_length=100)
    platform: Optional[str] = Field(None, max_length=50)
    template_type: str = Field(default="prompt", description="prompt, visual, structure, hybrid")
    structure: Dict[str, Any] = Field(..., description="Template structure")
    variables: Optional[List[TemplateVariable]] = None
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    examples: Optional[List[TemplateExample]] = None
    formatting_rules: Optional[Dict[str, Any]] = None
    platform_config: Optional[Dict[str, Any]] = None
    content_guidelines: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_active: bool = True
    is_default: bool = False
    is_public: bool = False
    version: str = "1.0"

# Create Schema
class TemplateCreate(TemplateBase):
    brand_id: UUID
    parent_template_id: Optional[UUID] = None

# Update Schema
class TemplateUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    platform: Optional[str] = None
    template_type: Optional[str] = None
    structure: Optional[Dict[str, Any]] = None
    variables: Optional[List[TemplateVariable]] = None
    system_prompt: Optional[str] = None
    user_prompt_template: Optional[str] = None
    examples: Optional[List[TemplateExample]] = None
    formatting_rules: Optional[Dict[str, Any]] = None
    platform_config: Optional[Dict[str, Any]] = None
    content_guidelines: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None
    version: Optional[str] = None

# Response Schema
class TemplateResponse(TemplateBase):
    id: UUID
    brand_id: UUID
    name: str  # For backward compatibility
    usage_count: int
    success_rate: float
    avg_engagement: float
    avg_rating: float
    total_ratings: int
    last_used_at: Optional[datetime] = None
    parent_template_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List Response
class TemplateListResponse(BaseModel):
    templates: List[TemplateResponse]
    total: int
    page: int
    page_size: int

# Generate Request Schema
class TemplateGenerateRequest(BaseModel):
    variables: Dict[str, Any] = Field(..., description="Variable values")
    variations_count: int = Field(default=1, ge=1, le=5)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    rag_enabled: bool = False
    custom_instructions: Optional[str] = None

# Generate Response Schema
class TemplateGenerateResponse(BaseModel):
    template_id: UUID
    generated_content: str
    variations: Optional[List[str]] = None
    variables_used: Dict[str, Any]
    metadata: Dict[str, Any]
    generation_id: UUID
    created_at: datetime

# Filter Schema
class TemplateFilter(BaseModel):
    category: Optional[str] = None
    platform: Optional[str] = None
    template_type: Optional[str] = None
    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    search_query: Optional[str] = None

# Rating Schema
class TemplateRating(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5")
    feedback: Optional[str] = None

# Clone Schema
class TemplateClone(BaseModel):
    title: str = Field(..., description="Title for cloned template")
    modifications: Optional[Dict[str, Any]] = None

# Stats Response
class TemplateStatsResponse(BaseModel):
    total_templates: int
    by_category: Dict[str, int]
    by_platform: Dict[str, int]
    most_used: List[TemplateResponse]
    highest_rated: List[TemplateResponse]
    avg_success_rate: float