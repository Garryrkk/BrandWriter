from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone
from app.basket.BasketModels import Basket, BasketItemType, BasketStatus
from app.draft.DraftModels import Draft
from app.basket.BasketSchemas import BasketCreate, BasketUpdate, BasketCreateFromDraft, BasketFilter


def make_naive(dt):
    """Convert timezone-aware datetime to naive (UTC)"""
    if dt is None:
        return None
    if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
        return dt.replace(tzinfo=None)
    return dt


class BasketService:
    """Service layer for Basket operations"""
    
    @staticmethod
    async def create_basket_item(db: AsyncSession, basket_data: BasketCreate) -> Basket:
        """Create a new basket item"""
        data = basket_data.model_dump()
        # Convert timezone-aware datetimes to naive for PostgreSQL
        if 'scheduled_date' in data:
            data['scheduled_date'] = make_naive(data['scheduled_date'])
        if 'scheduled_time' in data:
            data['scheduled_time'] = make_naive(data['scheduled_time'])
        
        basket = Basket(**data)
        db.add(basket)
        await db.commit()
        await db.refresh(basket)
        return basket
    
    @staticmethod
    async def create_from_draft(
        db: AsyncSession,
        brand_id: UUID,
        data: BasketCreateFromDraft
    ) -> Optional[Basket]:
        """Create basket item from draft"""
        # Get the draft
        draft = await db.get(Draft, data.draft_id)
        if not draft or draft.brand_id != brand_id:
            return None
        
        # Create basket item from draft
        basket = Basket(
            brand_id=brand_id,
            category=draft.category.value,
            platform=draft.platform.value,
            item_type=BasketItemType.POST,  # Default, can be determined from category
            title=draft.title,
            content=draft.content,
            assets=draft.asset_urls,
            notes=data.notes,
            tags=data.tags,
            priority=data.priority,
            draft_id=draft.id,
            status=BasketStatus.PENDING
        )
        
        db.add(basket)
        await db.commit()
        await db.refresh(basket)
        return basket
    
    @staticmethod
    async def get_basket_item_by_id(db: AsyncSession, basket_id: UUID) -> Optional[Basket]:
        """Get basket item by ID"""
        result = await db.execute(
            select(Basket).where(Basket.id == basket_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_basket_items_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[BasketFilter] = None
    ) -> tuple[List[Basket], int]:
        """Get all basket items for a brand with filters"""
        query = select(Basket).where(Basket.brand_id == brand_id)
        
        # Apply filters
        if filters:
            if filters.item_type:
                query = query.where(Basket.item_type == filters.item_type)
            if filters.platform:
                query = query.where(Basket.platform == filters.platform)
            if filters.status:
                query = query.where(Basket.status == filters.status)
            if filters.tags:
                # Check if any of the filter tags exist in the basket tags
                query = query.where(Basket.tags.overlap(filters.tags))
            if filters.priority_min:
                query = query.where(Basket.priority >= filters.priority_min)
            if filters.from_date:
                query = query.where(Basket.added_at >= filters.from_date)
            if filters.to_date:
                query = query.where(Basket.added_at <= filters.to_date)
        
        # Get total count
        count_query = select(func.count()).select_from(Basket).where(Basket.brand_id == brand_id)
        total = await db.scalar(count_query)
        
        # Get paginated results ordered by priority and date
        query = query.offset(skip).limit(limit).order_by(
            Basket.priority.desc(),
            Basket.added_at.desc()
        )
        result = await db.execute(query)
        items = result.scalars().all()
        
        return list(items), total or 0
    
    @staticmethod
    async def get_ready_items(
        db: AsyncSession,
        brand_id: UUID,
        limit: int = 50
    ) -> List[Basket]:
        """Get items ready for scheduling"""
        result = await db.execute(
            select(Basket)
            .where(
                and_(
                    Basket.brand_id == brand_id,
                    Basket.status == BasketStatus.READY
                )
            )
            .order_by(Basket.priority.desc(), Basket.added_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_basket_item(
        db: AsyncSession,
        basket_id: UUID,
        basket_data: BasketUpdate
    ) -> Optional[Basket]:
        """Update basket item"""
        basket = await BasketService.get_basket_item_by_id(db, basket_id)
        if not basket:
            return None
        
        update_data = basket_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        await db.execute(
            update(Basket)
            .where(Basket.id == basket_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(basket)
        return basket
    
    @staticmethod
    async def mark_as_scheduled(
        db: AsyncSession,
        basket_id: UUID
    ) -> Optional[Basket]:
        """Mark basket item as scheduled"""
        return await BasketService.update_basket_item(
            db,
            basket_id,
            BasketUpdate(status=BasketStatus.SCHEDULED)
        )
    
    @staticmethod
    async def delete_basket_item(db: AsyncSession, basket_id: UUID) -> bool:
        """Delete basket item"""
        result = await db.execute(
            delete(Basket).where(Basket.id == basket_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def bulk_delete_basket_items(db: AsyncSession, basket_ids: List[UUID]) -> int:
        """Delete multiple basket items"""
        result = await db.execute(
            delete(Basket).where(Basket.id.in_(basket_ids))
        )
        await db.commit()
        return result.rowcount
    
    @staticmethod
    async def archive_basket_item(db: AsyncSession, basket_id: UUID) -> Optional[Basket]:
        """Archive basket item"""
        return await BasketService.update_basket_item(
            db,
            basket_id,
            BasketUpdate(status=BasketStatus.ARCHIVED)
        )
    
    @staticmethod
    async def get_basket_stats(db: AsyncSession, brand_id: UUID) -> dict:
        """Get basket statistics"""
        result = await db.execute(
            select(
                Basket.status,
                func.count(Basket.id).label('count')
            )
            .where(Basket.brand_id == brand_id)
            .group_by(Basket.status)
        )
        
        stats = {row.status: row.count for row in result}
        return {
            'total': sum(stats.values()),
            'by_status': stats
        }