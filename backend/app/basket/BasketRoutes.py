from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
from app.db.database import get_db
from app.basket.BasketSchemas import (
    BasketCreate, BasketUpdate, BasketResponse, BasketListResponse,
    BasketCreateFromDraft, BasketFilter, BasketItemType, BasketStatus
)
from app.basket.BasketServices import BasketService

router = APIRouter(prefix="/basket", tags=["basket"])

@router.post("/", response_model=BasketResponse, status_code=201)
async def create_basket_item(
    basket_data: BasketCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new basket item"""
    basket = await BasketService.create_basket_item(db, basket_data)
    return basket

@router.post("/from-draft", response_model=BasketResponse, status_code=201)
async def create_from_draft(
    brand_id: UUID = Query(...),
    data: BasketCreateFromDraft = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create basket item from draft"""
    basket = await BasketService.create_from_draft(db, brand_id, data)
    if not basket:
        raise HTTPException(status_code=404, detail="Draft not found or invalid")
    return basket

@router.get("/", response_model=BasketListResponse)
async def get_basket_items(
    brand_id: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    item_type: Optional[BasketItemType] = None,
    platform: Optional[str] = None,
    status: Optional[BasketStatus] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all basket items with filters"""
    filters = BasketFilter(
        item_type=item_type,
        platform=platform,
        status=status
    )
    
    skip = (page - 1) * page_size
    items, total = await BasketService.get_basket_items_by_brand(
        db, brand_id, skip, page_size, filters
    )
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/ready", response_model=List[BasketResponse])
async def get_ready_items(
    brand_id: UUID = Query(...),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get items ready for scheduling"""
    items = await BasketService.get_ready_items(db, brand_id, limit)
    return items

@router.get("/stats", response_model=dict)
async def get_basket_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get basket statistics"""
    stats = await BasketService.get_basket_stats(db, brand_id)
    return stats

@router.get("/{basket_id}", response_model=BasketResponse)
async def get_basket_item(
    basket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get basket item by ID"""
    basket = await BasketService.get_basket_item_by_id(db, basket_id)
    if not basket:
        raise HTTPException(status_code=404, detail="Basket item not found")
    return basket

@router.patch("/{basket_id}", response_model=BasketResponse)
async def update_basket_item(
    basket_id: UUID,
    basket_data: BasketUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update basket item"""
    basket = await BasketService.update_basket_item(db, basket_id, basket_data)
    if not basket:
        raise HTTPException(status_code=404, detail="Basket item not found")
    return basket

@router.post("/{basket_id}/archive", response_model=BasketResponse)
async def archive_basket_item(
    basket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Archive basket item"""
    basket = await BasketService.archive_basket_item(db, basket_id)
    if not basket:
        raise HTTPException(status_code=404, detail="Basket item not found")
    return basket

@router.delete("/{basket_id}", status_code=204)
async def delete_basket_item(
    basket_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete basket item"""
    success = await BasketService.delete_basket_item(db, basket_id)
    if not success:
        raise HTTPException(status_code=404, detail="Basket item not found")
    return None

@router.post("/bulk-delete", status_code=200)
async def bulk_delete_basket_items(
    basket_ids: List[UUID],
    db: AsyncSession = Depends(get_db)
):
    """Delete multiple basket items"""
    deleted_count = await BasketService.bulk_delete_basket_items(db, basket_ids)
    return {"deleted_count": deleted_count}