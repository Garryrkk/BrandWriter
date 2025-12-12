from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
import time
from app.db.database import get_db
from app.templates.TemplatesSchemas import (
    TemplateCreate, TemplateUpdate, TemplateResponse, TemplateListResponse,
    TemplateFilter, TemplateGenerateRequest, TemplateGenerateResponse,
    TemplateRating, TemplateClone, TemplateStatsResponse
)
from app.templates.TemplatesServie import TemplateService
from app.brand.BrandServices import BrandService
from app.services.ai_service import AIService
from app.services.rag_service import RAGService
from app.generation.GenerationServices import GenerationService
from app.generation.GenerationSchemas import GenerationCreate

router = APIRouter(prefix="/templates", tags=["templates"])

# Initialize services
ai_service = AIService()
rag_service = RAGService()

@router.post("/", response_model=TemplateResponse, status_code=201)
async def create_template(
    template_data: TemplateCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new template"""
    # Verify brand exists
    brand = await BrandService.get_brand_by_id(db, template_data.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    template = await TemplateService.create_template(db, template_data)
    return template


@router.get("/", response_model=TemplateListResponse)
async def get_templates(
    brand_id: UUID = Query(..., description="Brand ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    platform: Optional[str] = None,
    template_type: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_default: Optional[bool] = None,
    tags: Optional[List[str]] = Query(None),
    search_query: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all templates with filters"""
    filters = TemplateFilter(
        category=category,
        platform=platform,
        template_type=template_type,
        is_active=is_active,
        is_default=is_default,
        tags=tags,
        search_query=search_query
    )
    
    skip = (page - 1) * page_size
    templates, total = await TemplateService.get_templates_by_brand(
        db, brand_id, skip, page_size, filters
    )
    
    return {
        "templates": templates,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/category/{category}", response_model=TemplateListResponse)
async def get_templates_by_category(
    category: str,
    brand_id: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get templates by specific category"""
    skip = (page - 1) * page_size
    templates, total = await TemplateService.get_templates_by_category(
        db, brand_id, category, skip, page_size
    )
    
    return {
        "templates": templates,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/default", response_model=TemplateResponse)
async def get_default_template(
    brand_id: UUID = Query(...),
    category: str = Query(...),
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get default template for a category/platform"""
    template = await TemplateService.get_default_template(
        db, brand_id, category, platform
    )
    if not template:
        raise HTTPException(
            status_code=404, 
            detail=f"No default template found for category '{category}'"
        )
    return template


@router.get("/most-used", response_model=List[TemplateResponse])
async def get_most_used_templates(
    brand_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get most used templates"""
    templates = await TemplateService.get_most_used_templates(db, brand_id, limit)
    return templates


@router.get("/highest-rated", response_model=List[TemplateResponse])
async def get_highest_rated_templates(
    brand_id: UUID = Query(...),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    """Get highest rated templates"""
    templates = await TemplateService.get_highest_rated_templates(db, brand_id, limit)
    return templates


@router.get("/stats", response_model=dict)
async def get_template_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get template statistics"""
    stats = await TemplateService.get_template_stats(db, brand_id)
    
    # Get most used and highest rated
    most_used = await TemplateService.get_most_used_templates(db, brand_id, 5)
    highest_rated = await TemplateService.get_highest_rated_templates(db, brand_id, 5)
    
    return {
        **stats,
        "most_used": most_used,
        "highest_rated": highest_rated
    }


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get template by ID"""
    template = await TemplateService.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update template"""
    template = await TemplateService.update_template(db, template_id, template_data)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: UUID,
    hard_delete: bool = Query(False, description="Permanently delete template"),
    db: AsyncSession = Depends(get_db)
):
    """Delete template (soft delete by default)"""
    if hard_delete:
        success = await TemplateService.hard_delete_template(db, template_id)
    else:
        success = await TemplateService.delete_template(db, template_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Template not found")
    return None


@router.post("/{template_id}/generate", response_model=TemplateGenerateResponse)
async def generate_from_template(
    template_id: UUID,
    request: TemplateGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate content using a template"""
    # Get template
    template = await TemplateService.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Get brand
    brand = await BrandService.get_brand_by_id(db, template.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    # Validate required variables
    if template.variables:
        required_vars = [v['name'] for v in template.variables if v.get('required', False)]
        missing_vars = [v for v in required_vars if v not in request.variables]
        if missing_vars:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required variables: {', '.join(missing_vars)}"
            )
    
    # Build prompt from template
    system_prompt = template.system_prompt
    user_prompt = template.user_prompt_template or ""
    
    # Replace variables in user prompt
    for var_name, var_value in request.variables.items():
        placeholder = f"{{{var_name}}}"
        user_prompt = user_prompt.replace(placeholder, str(var_value))
    
    # Add custom instructions if provided
    if request.custom_instructions:
        user_prompt += f"\n\nAdditional Instructions: {request.custom_instructions}"
    
    # Get RAG context if enabled
    rag_context = None
    if request.rag_enabled:
        query = user_prompt[:500]  # Use first part of prompt as query
        rag_context = await rag_service.get_context_for_generation(
            db, template.brand_id, query, category=template.category
        )
    
    # Add RAG context to prompt
    if rag_context:
        user_prompt += f"\n\nRelevant Context:\n{rag_context}"
    
    # Generate content
    start_time = time.time()
    
    variations = []
    for i in range(request.variations_count):
        temp = request.temperature + (i * 0.1) if i > 0 else request.temperature
        temp = min(temp, 1.0)
        
        result = await ai_service.generate_completion(
            prompt=user_prompt,
            system_prompt=system_prompt,
            temperature=temp,
            max_tokens=template.formatting_rules.get('max_length', 1000) if template.formatting_rules else 1000
        )
        
        variations.append(result["content"])
    
    generation_time = time.time() - start_time
    
    # Create generation record
    generation_data = GenerationCreate(
        brand_id=template.brand_id,
        category=template.category,
        platform=template.platform or "internal",
        prompt=user_prompt,
        rag_enabled=request.rag_enabled,
        rag_query=user_prompt[:500] if request.rag_enabled else None,
        temperature=request.temperature
    )
    
    generation = await GenerationService.create_generation(
        db,
        generation_data,
        output={"content": variations[0], "variations": variations},
        model_used=ai_service.model,
        generation_time=generation_time
    )
    
    # Increment template usage
    await TemplateService.increment_usage(db, template_id)
    
    return {
        "template_id": template_id,
        "generated_content": variations[0],
        "variations": variations[1:] if len(variations) > 1 else None,
        "variables_used": request.variables,
        "metadata": {
            "model": ai_service.model,
            "temperature": request.temperature,
            "generation_time": generation_time,
            "rag_enabled": request.rag_enabled
        },
        "generation_id": generation.id,
        "created_at": generation.created_at
    }


@router.post("/{template_id}/rate", response_model=TemplateResponse)
async def rate_template(
    template_id: UUID,
    rating: TemplateRating,
    db: AsyncSession = Depends(get_db)
):
    """Add rating to template"""
    template = await TemplateService.add_rating(db, template_id, rating)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/{template_id}/clone", response_model=TemplateResponse)
async def clone_template(
    template_id: UUID,
    clone_data: TemplateClone,
    brand_id: UUID = Query(..., description="Target brand ID"),
    db: AsyncSession = Depends(get_db)
):
    """Clone an existing template"""
    template = await TemplateService.clone_template(
        db, template_id, brand_id, clone_data.title, clone_data.modifications
    )
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.post("/{template_id}/duplicate", response_model=TemplateResponse)
async def duplicate_template(
    template_id: UUID,
    new_title: str = Query(..., description="Title for duplicated template"),
    db: AsyncSession = Depends(get_db)
):
    """Duplicate a template (clone within same brand)"""
    # Get original template to get brand_id
    original = await TemplateService.get_template_by_id(db, template_id)
    if not original:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template = await TemplateService.clone_template(
        db, template_id, original.brand_id, new_title
    )
    return template


@router.post("/{template_id}/set-default", response_model=TemplateResponse)
async def set_as_default(
    template_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Set template as default for its category"""
    template = await TemplateService.get_template_by_id(db, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Unset other defaults in same category
    from sqlalchemy import update as sql_update
    await db.execute(
        sql_update(template.__class__)
        .where(
            and_(
                template.__class__.brand_id == template.brand_id,
                template.__class__.category == template.category,
                template.__class__.is_default == True
            )
        )
        .values(is_default=False)
    )
    
    # Set this as default
    updated = await TemplateService.update_template(
        db, template_id, TemplateUpdate(is_default=True)
    )
    return updated