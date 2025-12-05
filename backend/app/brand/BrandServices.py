from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import Optional, List
from uuid import UUID
from app.models.brand import Brand
from app.brand.BrandSchemas import BrandCreate, BrandUpdate
from datetime import datetime

class BrandService:
    """Service layer for Brand operations"""
    
    @staticmethod
    async def create_brand(db: AsyncSession, brand_data: BrandCreate) -> Brand:
        """Create a new brand"""
        brand = Brand(**brand_data.model_dump())
        db.add(brand)
        await db.commit()
        await db.refresh(brand)
        return brand
    
    @staticmethod
    async def get_brand_by_id(db: AsyncSession, brand_id: UUID) -> Optional[Brand]:
        """Get brand by ID"""
        result = await db.execute(
            select(Brand).where(Brand.id == brand_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_brand_by_name(db: AsyncSession, name: str) -> Optional[Brand]:
        """Get brand by name"""
        result = await db.execute(
            select(Brand).where(Brand.name == name)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_all_brands(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        is_active: Optional[bool] = None
    ) -> tuple[List[Brand], int]:
        """Get all brands with pagination"""
        query = select(Brand)
        
        if is_active is not None:
            query = query.where(Brand.is_active == is_active)
        
        # Get total count
        count_query = select(func.count()).select_from(Brand)
        if is_active is not None:
            count_query = count_query.where(Brand.is_active == is_active)
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Brand.created_at.desc())
        result = await db.execute(query)
        brands = result.scalars().all()
        
        return list(brands), total or 0
    
    @staticmethod
    async def update_brand(
        db: AsyncSession,
        brand_id: UUID,
        brand_data: BrandUpdate
    ) -> Optional[Brand]:
        """Update brand"""
        # Get existing brand
        brand = await BrandService.get_brand_by_id(db, brand_id)
        if not brand:
            return None
        
        # Update fields
        update_data = brand_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        await db.execute(
            update(Brand)
            .where(Brand.id == brand_id)
            .values(**update_data)
        )
        await db.commit()
        
        # Refresh and return
        await db.refresh(brand)
        return brand
    
    @staticmethod
    async def delete_brand(db: AsyncSession, brand_id: UUID) -> bool:
        """Delete brand (soft delete by setting is_active=False)"""
        result = await db.execute(
            update(Brand)
            .where(Brand.id == brand_id)
            .values(is_active=False, updated_at=datetime.utcnow())
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def hard_delete_brand(db: AsyncSession, brand_id: UUID) -> bool:
        """Permanently delete brand"""
        result = await db.execute(
            delete(Brand).where(Brand.id == brand_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def get_active_brand(db: AsyncSession) -> Optional[Brand]:
        """Get the first active brand (for no-login scenario)"""
        result = await db.execute(
            select(Brand)
            .where(Brand.is_active == True)
            .order_by(Brand.created_at.asc())
            .limit(1)
        )
        return result.scalar_one_or_none()