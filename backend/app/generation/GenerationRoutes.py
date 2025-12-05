from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
import time
from app.db.database import get_db
from app.schemas.generation import (
    GenerationCreate, GenerationResponse, GenerationListResponse,
    QuickGenerateRequest, BatchGenerateRequest, GenerationFeedback,
    GenerationFilter, BatchGenerationResponse
)
from app.generation.GenerationServices import GenerationService
from app.brand.BrandServices import BrandService
from app.services.rag_service import RAGService
from app.services.ai_service import AIService
from app.draft.DraftServices import DraftService
from app.draft.DraftSchemas import DraftCreate, Platform, ContentCategory

router = APIRouter(prefix="/generations", tags=["generations"])

# Initialize AI and RAG services
ai_service = AIService()
rag_service = RAGService()

@router.post("/generate", response_model=GenerationResponse, status_code=201)
async def generate_content(
    request: QuickGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Quick content generation"""
    # Get brand
    brand = await BrandService.get_brand_by_id(db, request.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    # Get RAG context if enabled
    rag_context = None
    if request.rag_enabled:
        query = request.custom_prompt or f"Content about {request.category}"
        rag_context = await rag_service.get_context_for_generation(
            db, request.brand_id, query, category=request.category
        )
    
    # Generate content
    start_time = time.time()
    topic = request.custom_prompt or f"Create {request.category} content"
    
    variations = await ai_service.generate_content(
        brand=brand,
        category=request.category,
        topic=topic,
        rag_context=rag_context,
        variations=request.variations_count
    )
    
    generation_time = time.time() - start_time
    
    # Create generation record
    generation_data = GenerationCreate(
        brand_id=request.brand_id,
        category=request.category,
        platform=request.platform,
        prompt=topic,
        rag_enabled=request.rag_enabled,
        rag_query=query if request.rag_enabled else None
    )
    
    generation = await GenerationService.create_generation(
        db,
        generation_data,
        output=variations[0] if variations else {},
        model_used=ai_service.model,
        generation_time=generation_time,
        token_count=variations[0].get('tokens') if variations else None
    )
    
    # Store variations
    if len(variations) > 1:
        generation.variations = variations
        await db.commit()
        await db.refresh(generation)
    
    return generation

@router.post("/batch", response_model=BatchGenerationResponse)
async def batch_generate(
    request: BatchGenerateRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Generate content in batch for multiple categories"""
    # Validate brand
    brand = await BrandService.get_brand_by_id(db, request.brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    from uuid import uuid4
    from datetime import datetime
    
    batch_id = uuid4()
    
    # This should ideally be done in background
    # For now, doing it synchronously
    all_generations = []
    
    for category in request.categories:
        for i in range(request.count_per_category):
            # Get RAG context
            rag_context = None
            if request.rag_enabled:
                query = f"Content about {category}"
                rag_context = await rag_service.get_context_for_generation(
                    db, request.brand_id, query, category=category
                )
            
            # Generate
            start_time = time.time()
            variations = await ai_service.generate_content(
                brand=brand,
                category=category,
                topic=f"Create {category} content - #{i+1}",
                rag_context=rag_context,
                variations=1
            )
            generation_time = time.time() - start_time
            
            # Create record
            generation_data = GenerationCreate(
                brand_id=request.brand_id,
                category=category,
                platform=None,
                prompt=f"Batch generation for {category}",
                rag_enabled=request.rag_enabled
            )
            
            generation = await GenerationService.create_generation(
                db,
                generation_data,
                output=variations[0] if variations else {},
                model_used=ai_service.model,
                generation_time=generation_time
            )
            
            # Update with batch info
            generation.batch_id = batch_id
            generation.is_auto_generated = True
            
            all_generations.append(generation)
    
    await db.commit()
    
    # Calculate stats
    generations_by_category = {}
    for gen in all_generations:
        if gen.category not in generations_by_category:
            generations_by_category[gen.category] = 0
        generations_by_category[gen.category] += 1
    
    return {
        "batch_id": batch_id,
        "brand_id": request.brand_id,
        "total_generated": len(all_generations),
        "generations_by_category": generations_by_category,
        "status": "completed",
        "started_at": datetime.utcnow(),
        "completed_at": datetime.utcnow()
    }

@router.get("/", response_model=GenerationListResponse)
async def get_generations(
    brand_id: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    platform: Optional[str] = None,
    is_auto_generated: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all generations with filters"""
    filters = GenerationFilter(
        category=category,
        platform=platform,
        is_auto_generated=is_auto_generated
    )
    
    skip = (page - 1) * page_size
    generations, total = await GenerationService.get_generations_by_brand(
        db, brand_id, skip, page_size, filters
    )
    
    return {
        "generations": generations,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/stats", response_model=dict)
async def get_generation_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get generation statistics"""
    stats = await GenerationService.get_generation_stats(db, brand_id)
    return stats

@router.get("/{generation_id}", response_model=GenerationResponse)
async def get_generation(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get generation by ID"""
    generation = await GenerationService.get_generation_by_id(db, generation_id)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    return generation

@router.post("/{generation_id}/feedback", response_model=GenerationResponse)
async def add_feedback(
    generation_id: UUID,
    feedback: GenerationFeedback,
    db: AsyncSession = Depends(get_db)
):
    """Add feedback to generation"""
    generation = await GenerationService.add_feedback(db, generation_id, feedback)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    return generation

@router.post("/{generation_id}/to-draft", response_model=dict)
async def generation_to_draft(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Convert generation to draft"""
    generation = await GenerationService.get_generation_by_id(db, generation_id)
    if not generation:
        raise HTTPException(status_code=404, detail="Generation not found")
    
    # Create draft from generation
    draft_data = DraftCreate(
        brand_id=generation.brand_id,
        category=ContentCategory(generation.category),
        platform=Platform(generation.platform) if generation.platform else Platform.INTERNAL,
        title=f"Generated {generation.category}",
        content=generation.output,
        metadata=generation.metadata,
        tone=generation.tone,
        prompt_used=generation.prompt,
        model_used=generation.model_used
    )
    
    draft = await DraftService.create_draft(db, draft_data)
    
    # Mark generation as used
    await GenerationService.mark_as_used(db, generation_id, draft_id=draft.id)
    
    return {"draft_id": draft.id, "message": "Generation converted to draft"}

@router.delete("/{generation_id}", status_code=204)
async def delete_generation(
    generation_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete generation"""
    success = await GenerationService.delete_generation(db, generation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Generation not found")
    return None