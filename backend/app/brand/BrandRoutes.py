from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from app.db.database import get_db
from app.brand.BrandSchemas import (
    BrandCreate, BrandUpdate, BrandResponse, BrandListResponse
)
from app.brand.BrandServices import BrandService

router = APIRouter(prefix="/brands", tags=["brands"])

@router.post("/", response_model=BrandResponse, status_code=201)
async def create_brand(
    brand_data: BrandCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new brand"""
    # Check if brand name already exists
    existing = await BrandService.get_brand_by_name(db, brand_data.name)
    if existing:
        raise HTTPException(status_code=400, detail="Brand name already exists")
    
    brand = await BrandService.create_brand(db, brand_data)
    return brand

@router.get("/", response_model=BrandListResponse)
async def get_brands(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all brands with pagination"""
    skip = (page - 1) * page_size
    brands, total = await BrandService.get_all_brands(db, skip, page_size, is_active)
    
    return {
        "brands": brands,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/active", response_model=BrandResponse)
async def get_active_brand(db: AsyncSession = Depends(get_db)):
    """Get the active brand (for no-login mode)"""
    brand = await BrandService.get_active_brand(db)
    if not brand:
        raise HTTPException(status_code=404, detail="No active brand found")
    return brand

@router.get("/{brand_id}", response_model=BrandResponse)
async def get_brand(
    brand_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get brand by ID"""
    brand = await BrandService.get_brand_by_id(db, brand_id)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.patch("/{brand_id}", response_model=BrandResponse)
async def update_brand(
    brand_id: UUID,
    brand_data: BrandUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update brand"""
    brand = await BrandService.update_brand(db, brand_id, brand_data)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand

@router.delete("/{brand_id}", status_code=204)
async def delete_brand(
    brand_id: UUID,
    hard_delete: bool = Query(False),
    db: AsyncSession = Depends(get_db)
):
    """Delete brand (soft delete by default, hard delete if specified)"""
    if hard_delete:
        success = await BrandService.hard_delete_brand(db, brand_id)
    else:
        success = await BrandService.delete_brand(db, brand_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Brand not found")
    
    return None