from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from app.history.HistoryModels import History, HistoryStatus

class HistoryService:
    """Service layer for History operations"""
    
    @staticmethod
    async def create_history_entry(
        db: AsyncSession,
        brand_id: UUID,
        category: str,
        platform: str,
        content: Dict[str, Any],
        **kwargs
    ) -> History:
        """Create a new history entry"""
        history = History(
            brand_id=brand_id,
            category=category,
            platform=platform,
            content=content,
            **kwargs
        )
        db.add(history)
        await db.commit()
        await db.refresh(history)
        return history
    
    @staticmethod
    async def get_history_by_id(db: AsyncSession, history_id: UUID) -> Optional[History]:
        """Get history entry by ID"""
        result = await db.execute(
            select(History).where(History.id == history_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_history_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        category: Optional[str] = None,
        platform: Optional[str] = None,
        status: Optional[HistoryStatus] = None,
        from_date: Optional[datetime] = None,
        to_date: Optional[datetime] = None
    ) -> tuple[List[History], int]:
        """Get history entries for a brand with filters"""
        query = select(History).where(History.brand_id == brand_id)
        
        # Apply filters
        if category:
            query = query.where(History.category == category)
        if platform:
            query = query.where(History.platform == platform)
        if status:
            query = query.where(History.status == status)
        if from_date:
            query = query.where(History.generated_at >= from_date)
        if to_date:
            query = query.where(History.generated_at <= to_date)
        
        # Get total count
        count_query = select(func.count()).select_from(History).where(History.brand_id == brand_id)
        if category:
            count_query = count_query.where(History.category == category)
        if platform:
            count_query = count_query.where(History.platform == platform)
        if status:
            count_query = count_query.where(History.status == status)
        
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(History.generated_at.desc())
        result = await db.execute(query)
        entries = result.scalars().all()
        
        return list(entries), total or 0
    
    @staticmethod
    async def get_published_content(
        db: AsyncSession,
        brand_id: UUID,
        platform: Optional[str] = None,
        limit: int = 50
    ) -> List[History]:
        """Get published content"""
        query = select(History).where(
            and_(
                History.brand_id == brand_id,
                History.status == HistoryStatus.PUBLISHED
            )
        )
        
        if platform:
            query = query.where(History.platform == platform)
        
        query = query.order_by(History.published_at.desc()).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())
    
    @staticmethod
    async def get_content_performance(
        db: AsyncSession,
        brand_id: UUID,
        days: int = 30
    ) -> List[History]:
        """Get content with engagement metrics from last N days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        result = await db.execute(
            select(History)
            .where(
                and_(
                    History.brand_id == brand_id,
                    History.status == HistoryStatus.PUBLISHED,
                    History.published_at >= cutoff_date,
                    History.engagement_metrics.isnot(None)
                )
            )
            .order_by(History.published_at.desc())
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def update_history(
        db: AsyncSession,
        history_id: UUID,
        update_data: dict
    ) -> Optional[History]:
        """Update history entry"""
        history = await HistoryService.get_history_by_id(db, history_id)
        if not history:
            return None
        
        await db.execute(
            update(History)
            .where(History.id == history_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(history)
        return history
    
    @staticmethod
    async def mark_as_published(
        db: AsyncSession,
        history_id: UUID,
        published_url: str,
        published_at: Optional[datetime] = None
    ) -> Optional[History]:
        """Mark content as published"""
        if published_at is None:
            published_at = datetime.utcnow()
        
        return await HistoryService.update_history(
            db,
            history_id,
            {
                'status': HistoryStatus.PUBLISHED,
                'published_url': published_url,
                'published_at': published_at
            }
        )
    
    @staticmethod
    async def update_engagement_metrics(
        db: AsyncSession,
        history_id: UUID,
        metrics: Dict[str, int]
    ) -> Optional[History]:
        """Update engagement metrics for published content"""
        history = await HistoryService.get_history_by_id(db, history_id)
        if not history:
            return None
        
        # Merge with existing metrics
        current_metrics = history.engagement_metrics or {}
        current_metrics.update(metrics)
        
        return await HistoryService.update_history(
            db,
            history_id,
            {'engagement_metrics': current_metrics}
        )
    
    @staticmethod
    async def delete_history(db: AsyncSession, history_id: UUID) -> bool:
        """Delete history entry"""
        result = await db.execute(
            delete(History).where(History.id == history_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def get_history_stats(db: AsyncSession, brand_id: UUID) -> dict:
        """Get history statistics"""
        # Total count
        total_result = await db.execute(
            select(func.count(History.id))
            .where(History.brand_id == brand_id)
        )
        total = total_result.scalar() or 0
        
        # Count by status
        status_result = await db.execute(
            select(
                History.status,
                func.count(History.id).label('count')
            )
            .where(History.brand_id == brand_id)
            .group_by(History.status)
        )
        by_status = {row.status: row.count for row in status_result}
        
        # Count by platform
        platform_result = await db.execute(
            select(
                History.platform,
                func.count(History.id).label('count')
            )
            .where(History.brand_id == brand_id)
            .group_by(History.platform)
        )
        by_platform = {row.platform: row.count for row in platform_result}
        
        # Today's published count
        today = datetime.utcnow().date()
        today_result = await db.execute(
            select(func.count(History.id))
            .where(
                and_(
                    History.brand_id == brand_id,
                    History.status == HistoryStatus.PUBLISHED,
                    func.date(History.published_at) == today
                )
            )
        )
        today_published = today_result.scalar() or 0
        
        # This week's published count
        week_start = datetime.utcnow() - timedelta(days=7)
        week_result = await db.execute(
            select(func.count(History.id))
            .where(
                and_(
                    History.brand_id == brand_id,
                    History.status == HistoryStatus.PUBLISHED,
                    History.published_at >= week_start
                )
            )
        )
        week_published = week_result.scalar() or 0
        
        return {
            'total': total,
            'by_status': by_status,
            'by_platform': by_platform,
            'today_published': today_published,
            'week_published': week_published
        }
    
    @staticmethod
    async def get_top_performing_content(
        db: AsyncSession,
        brand_id: UUID,
        metric: str = 'likes',
        limit: int = 10,
        days: int = 30
    ) -> List[History]:
        """Get top performing content by a specific metric"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # This would need to be adapted based on how engagement_metrics is structured
        result = await db.execute(
            select(History)
            .where(
                and_(
                    History.brand_id == brand_id,
                    History.status == HistoryStatus.PUBLISHED,
                    History.published_at >= cutoff_date,
                    History.engagement_metrics.isnot(None)
                )
            )
            .order_by(History.published_at.desc())
            .limit(limit * 3)  # Get more than needed, then filter
        )
        
        entries = list(result.scalars().all())
        
        # Sort by the specified metric
        entries_with_metric = [
            e for e in entries 
            if e.engagement_metrics and metric in e.engagement_metrics
        ]
        entries_with_metric.sort(
            key=lambda x: x.engagement_metrics.get(metric, 0),
            reverse=True
        )
        
        return entries_with_metric[:limit]