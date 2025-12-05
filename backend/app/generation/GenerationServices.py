from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
import time
from app.generation.GenerationModels import Generation
from app.generation.GenerationSchemas import GenerationCreate, GenerationUpdate, GenerationFeedback, GenerationFilter

class GenerationService:
    """Service layer for Generation operations"""
    
    @staticmethod
    async def create_generation(
        db: AsyncSession,
        generation_data: GenerationCreate,
        output: Dict[str, Any],
        model_used: str,
        generation_time: float,
        token_count: Optional[int] = None
    ) -> Generation:
        """Create a new generation record"""
        generation = Generation(
            **generation_data.model_dump(),
            output=output,
            model_used=model_used,
            generation_time=generation_time,
            token_count=token_count
        )
        db.add(generation)
        await db.commit()
        await db.refresh(generation)
        return generation
    
    @staticmethod
    async def get_generation_by_id(db: AsyncSession, generation_id: UUID) -> Optional[Generation]:
        """Get generation by ID"""
        result = await db.execute(
            select(Generation).where(Generation.id == generation_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_generations_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[GenerationFilter] = None
    ) -> tuple[List[Generation], int]:
        """Get all generations for a brand with filters"""
        query = select(Generation).where(Generation.brand_id == brand_id)
        
        # Apply filters
        if filters:
            if filters.category:
                query = query.where(Generation.category == filters.category)
            if filters.platform:
                query = query.where(Generation.platform == filters.platform)
            if filters.is_auto_generated is not None:
                query = query.where(Generation.is_auto_generated == filters.is_auto_generated)
            if filters.was_used is not None:
                query = query.where(Generation.was_used == filters.was_used)
            if filters.batch_id:
                query = query.where(Generation.batch_id == filters.batch_id)
            if filters.from_date:
                query = query.where(Generation.created_at >= filters.from_date)
            if filters.to_date:
                query = query.where(Generation.created_at <= filters.to_date)
            if filters.min_rating:
                query = query.where(Generation.user_rating >= filters.min_rating)
        
        # Get total count
        count_query = select(func.count()).select_from(Generation).where(Generation.brand_id == brand_id)
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Generation.created_at.desc())
        result = await db.execute(query)
        generations = result.scalars().all()
        
        return list(generations), total or 0
    
    @staticmethod
    async def get_generations_by_category(
        db: AsyncSession,
        brand_id: UUID,
        category: str,
        limit: int = 50
    ) -> List[Generation]:
        """Get recent generations for a specific category"""
        result = await db.execute(
            select(Generation)
            .where(
                and_(
                    Generation.brand_id == brand_id,
                    Generation.category == category
                )
            )
            .order_by(Generation.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_generations_by_batch(
        db: AsyncSession,
        batch_id: UUID
    ) -> List[Generation]:
        """Get all generations in a batch"""
        result = await db.execute(
            select(Generation)
            .where(Generation.batch_id == batch_id)
            .order_by(Generation.created_at.asc())
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_generation(
        db: AsyncSession,
        generation_id: UUID,
        update_data: dict
    ) -> Optional[Generation]:
        """Update generation"""
        generation = await GenerationService.get_generation_by_id(db, generation_id)
        if not generation:
            return None
        
        await db.execute(
            update(Generation)
            .where(Generation.id == generation_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(generation)
        return generation
    
    @staticmethod
    async def add_feedback(
        db: AsyncSession,
        generation_id: UUID,
        feedback: GenerationFeedback
    ) -> Optional[Generation]:
        """Add user feedback to generation"""
        return await GenerationService.update_generation(
            db,
            generation_id,
            {
                'user_rating': feedback.rating,
                'user_feedback': feedback.feedback,
                'was_used': feedback.was_used
            }
        )
    
    @staticmethod
    async def mark_as_used(
        db: AsyncSession,
        generation_id: UUID,
        draft_id: Optional[UUID] = None,
        basket_id: Optional[UUID] = None
    ) -> Optional[Generation]:
        """Mark generation as used"""
        update_data = {'was_used': True}
        if draft_id:
            update_data['draft_id'] = draft_id
        if basket_id:
            update_data['basket_id'] = basket_id
        
        return await GenerationService.update_generation(
            db,
            generation_id,
            update_data
        )
    
    @staticmethod
    async def delete_generation(db: AsyncSession, generation_id: UUID) -> bool:
        """Delete generation"""
        result = await db.execute(
            delete(Generation).where(Generation.id == generation_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def get_generation_stats(db: AsyncSession, brand_id: UUID) -> dict:
        """Get generation statistics"""
        # Total count
        total_result = await db.execute(
            select(func.count(Generation.id))
            .where(Generation.brand_id == brand_id)
        )
        total = total_result.scalar() or 0
        
        # Count by category
        category_result = await db.execute(
            select(
                Generation.category,
                func.count(Generation.id).label('count')
            )
            .where(Generation.brand_id == brand_id)
            .group_by(Generation.category)
        )
        by_category = {row.category: row.count for row in category_result}
        
        # Usage rate
        used_result = await db.execute(
            select(func.count(Generation.id))
            .where(
                and_(
                    Generation.brand_id == brand_id,
                    Generation.was_used == True
                )
            )
        )
        used_count = used_result.scalar() or 0
        usage_rate = (used_count / total * 100) if total > 0 else 0
        
        # Average rating
        rating_result = await db.execute(
            select(func.avg(Generation.user_rating))
            .where(
                and_(
                    Generation.brand_id == brand_id,
                    Generation.user_rating.isnot(None)
                )
            )
        )
        avg_rating = rating_result.scalar() or 0
        
        # Today's count
        today = datetime.utcnow().date()
        today_result = await db.execute(
            select(func.count(Generation.id))
            .where(
                and_(
                    Generation.brand_id == brand_id,
                    func.date(Generation.created_at) == today
                )
            )
        )
        today_count = today_result.scalar() or 0
        
        return {
            'total': total,
            'by_category': by_category,
            'used_count': used_count,
            'usage_rate': round(usage_rate, 2),
            'avg_rating': round(float(avg_rating), 2) if avg_rating else 0,
            'today_count': today_count
        }
    
    @staticmethod
    async def create_batch_generations(
        db: AsyncSession,
        brand_id: UUID,
        category: str,
        generations_data: List[Dict[str, Any]]
    ) -> tuple[UUID, List[Generation]]:
        """Create multiple generations in a batch"""
        batch_id = uuid4()
        generations = []
        
        for gen_data in generations_data:
            generation = Generation(
                brand_id=brand_id,
                category=category,
                batch_id=batch_id,
                is_auto_generated=True,
                **gen_data
            )
            generations.append(generation)
            db.add(generation)
        
        await db.commit()
        
        # Refresh all
        for gen in generations:
            await db.refresh(gen)
        
        return batch_id, generations