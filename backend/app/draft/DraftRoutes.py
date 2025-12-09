from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
from app.db.database import get_db
from app.draft.DraftSchemas import (
    DraftCreate, DraftUpdate, DraftResponse, DraftListResponse,
    DraftFilter, ContentCategory, Platform, DraftStatus
)
from app.draft.DraftServices import DraftService

router = APIRouter(prefix="/drafts", tags=["drafts"])

@router.post("/", response_model=DraftResponse, status_code=201)
async def create_draft(
    draft_data: DraftCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new draft"""
    draft = await DraftService.create_draft(db, draft_data)
    return draft

@router.get("/", response_model=DraftListResponse)
async def get_drafts(
    brand_id: UUID = Query(..., description="Brand ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: Optional[ContentCategory] = None,
    platform: Optional[Platform] = None,
    status: Optional[DraftStatus] = None,
    search_query: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all drafts with filters"""
    filters = DraftFilter(
        category=category,
        platform=platform,
        status=status,
        search_query=search_query
    )
    
    skip = (page - 1) * page_size
    drafts, total = await DraftService.get_drafts_by_brand(
        db, brand_id, skip, page_size, filters
    )
    
    return {
        "drafts": drafts,
        "total": total,
        "page": page,
        "page_size": page_size,
        "filters": filters.model_dump(exclude_none=True)
    }

@router.get("/category/{category}", response_model=DraftListResponse)
async def get_drafts_by_category(
    category: ContentCategory,
    brand_id: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get drafts by category"""
    skip = (page - 1) * page_size
    drafts, total = await DraftService.get_drafts_by_category(
        db, brand_id, category, skip, page_size
    )
    
    return {
        "drafts": drafts,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/stats", response_model=dict)
async def get_draft_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get draft statistics by category"""
    stats = await DraftService.get_draft_count_by_category(db, brand_id)
    return stats

@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(
    draft_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get draft by ID"""
    draft = await DraftService.get_draft_by_id(db, draft_id)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.patch("/{draft_id}", response_model=DraftResponse)
async def update_draft(
    draft_id: UUID,
    draft_data: DraftUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update draft"""
    draft = await DraftService.update_draft(db, draft_id, draft_data)
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft

@router.delete("/{draft_id}", status_code=204)
async def delete_draft(
    draft_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete draft"""
    success = await DraftService.delete_draft(db, draft_id)
    if not success:
        raise HTTPException(status_code=404, detail="Draft not found")
    return None

@router.post("/bulk-delete", status_code=200)
async def bulk_delete_drafts(
    draft_ids: List[UUID],
    db: AsyncSession = Depends(get_db)
):
    """Delete multiple drafts"""
    deleted_count = await DraftService.bulk_delete_drafts(db, draft_ids)
    return {"deleted_count": deleted_count}