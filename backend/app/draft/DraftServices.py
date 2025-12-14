from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.draft.DraftModels import Draft, ContentCategory, Platform, DraftStatus
from app.draft.DraftSchemas import DraftCreate, DraftUpdate, DraftFilter

class DraftService:
    """Service layer for Draft operations"""
    
    @staticmethod
    async def create_draft(db: AsyncSession, draft_data: DraftCreate) -> Draft:
        """Create a new draft"""
        draft = Draft(**draft_data.model_dump())
        db.add(draft)
        await db.commit()
        await db.refresh(draft)
        return draft
    
    @staticmethod
    async def get_draft_by_id(db: AsyncSession, draft_id: UUID) -> Optional[Draft]:
        """Get draft by ID"""
        result = await db.execute(
            select(Draft).where(Draft.id == draft_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_drafts_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[DraftFilter] = None
    ) -> tuple[List[Draft], int]:
        """Get all drafts for a brand with filters"""
        query = select(Draft).where(Draft.brand_id == brand_id)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.where(Draft.category == filters.category)
            if filters.platform:
                query = query.where(Draft.platform == filters.platform)
            if filters.status:
                query = query.where(Draft.status == filters.status)
            if filters.from_date:
                query = query.where(Draft.generated_at >= filters.from_date)
            if filters.to_date:
                query = query.where(Draft.generated_at <= filters.to_date)
            if filters.search_query:
                search = f"%{filters.search_query}%"
                query = query.where(
                    or_(
                        Draft.title.ilike(search),
                        Draft.notes.ilike(search)
                    )
                )
        
        # Get total count
        count_query = select(func.count()).select_from(Draft).where(Draft.brand_id == brand_id)
        if filters:
            # Apply same filters to count
            if filters.category:
                count_query = count_query.where(Draft.category == filters.category)
            if filters.platform:
                count_query = count_query.where(Draft.platform == filters.platform)
            if filters.status:
                count_query = count_query.where(Draft.status == filters.status)
        
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Draft.generated_at.desc())
        result = await db.execute(query)
        drafts = result.scalars().all()
        
        return list(drafts), total or 0
    
    @staticmethod
    async def get_drafts_by_category(
        db: AsyncSession,
        brand_id: UUID,
        category: ContentCategory,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Draft], int]:
        """Get drafts by specific category"""
        query = select(Draft).where(
            and_(
                Draft.brand_id == brand_id,
                Draft.category == category
            )
        )
        
        count_query = select(func.count()).select_from(Draft).where(
            and_(
                Draft.brand_id == brand_id,
                Draft.category == category
            )
        )
        total = await db.scalar(count_query)
        
        query = query.offset(skip).limit(limit).order_by(Draft.generated_at.desc())
        result = await db.execute(query)
        drafts = result.scalars().all()
        
        return list(drafts), total or 0
    
    @staticmethod
    async def update_draft(
        db: AsyncSession,
        draft_id: UUID,
        draft_data: DraftUpdate
    ) -> Optional[Draft]:
        """Update draft"""
        draft = await DraftService.get_draft_by_id(db, draft_id)
        if not draft:
            return None
        
        update_data = draft_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        await db.execute(
            update(Draft)
            .where(Draft.id == draft_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(draft)
        return draft
    
    @staticmethod
    async def delete_draft(db: AsyncSession, draft_id: UUID) -> bool:
        """Delete draft"""
        result = await db.execute(
            delete(Draft).where(Draft.id == draft_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def bulk_delete_drafts(db: AsyncSession, draft_ids: List[UUID]) -> int:
        """Delete multiple drafts"""
        result = await db.execute(
            delete(Draft).where(Draft.id.in_(draft_ids))
        )
        await db.commit()
        return result.rowcount
    
    @staticmethod
    async def get_draft_count_by_category(
        db: AsyncSession,
        brand_id: UUID
    ) -> dict:
        """Get count of drafts per category"""
        from sqlalchemy import func
        
        result = await db.execute(
            select(
                Draft.category,
                func.count(Draft.id).label('count')
            )
            .where(Draft.brand_id == brand_id)
            .group_by(Draft.category)
        )
        
        counts = {row.category: row.count for row in result}
        return counts