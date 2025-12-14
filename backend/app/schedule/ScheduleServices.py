from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_
from typing import Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from app.schedule.ScheduleModels import Schedule, PostingStatus
from app.basket.BasketModels import Basket
from app.schedule.ScheduleSchemas import ScheduleCreate, ScheduleUpdate, ScheduleCreateFromBasket, ScheduleFilter
from app.basket.BasketServices import BasketService

class ScheduleService:
    """Service layer for Schedule operations"""
    
    @staticmethod
    async def create_schedule(db: AsyncSession, schedule_data: ScheduleCreate) -> Schedule:
        """Create a new schedule"""
        schedule = Schedule(**schedule_data.model_dump())
        db.add(schedule)
        await db.commit()
        await db.refresh(schedule)
        return schedule
    
    @staticmethod
    async def create_from_basket(
        db: AsyncSession,
        brand_id: UUID,
        data: ScheduleCreateFromBasket
    ) -> Optional[Schedule]:
        """Create schedule from basket item"""
        # Get basket item
        basket = await db.get(Basket, data.basket_id)
        if not basket or basket.brand_id != brand_id:
            return None
        
        # Create schedule
        schedule = Schedule(
            brand_id=brand_id,
            platform=basket.platform,
            category=basket.category,
            basket_id=basket.id,
            content=basket.content,
            assets=basket.assets,
            scheduled_date=data.scheduled_date,
            scheduled_time=data.scheduled_time,
            timezone=data.timezone,
            posting_options=data.posting_options or basket.posting_options,
            posting_status=PostingStatus.PENDING
        )
        
        db.add(schedule)
        
        # Mark basket as scheduled
        await BasketService.mark_as_scheduled(db, basket.id)
        
        await db.commit()
        await db.refresh(schedule)
        return schedule
    
    @staticmethod
    async def get_schedule_by_id(db: AsyncSession, schedule_id: UUID) -> Optional[Schedule]:
        """Get schedule by ID"""
        result = await db.execute(
            select(Schedule).where(Schedule.id == schedule_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_schedules_by_brand(
        db: AsyncSession,
        brand_id: UUID,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[ScheduleFilter] = None
    ) -> tuple[List[Schedule], int]:
        """Get all schedules for a brand with filters"""
        query = select(Schedule).where(Schedule.brand_id == brand_id)
        
        # Apply filters
        if filters:
            if filters.platform:
                query = query.where(Schedule.platform == filters.platform)
            if filters.posting_status:
                query = query.where(Schedule.posting_status == filters.posting_status)
            if filters.category:
                query = query.where(Schedule.category == filters.category)
            if filters.from_date:
                query = query.where(Schedule.scheduled_date >= filters.from_date)
            if filters.to_date:
                query = query.where(Schedule.scheduled_date <= filters.to_date)
        
        # Get total count
        count_query = select(func.count()).select_from(Schedule).where(Schedule.brand_id == brand_id)
        total = await db.scalar(count_query)
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Schedule.scheduled_date.asc())
        result = await db.execute(query)
        schedules = result.scalars().all()
        
        return list(schedules), total or 0
    
    @staticmethod
    async def get_pending_schedules(
        db: AsyncSession,
        before_time: Optional[datetime] = None
    ) -> List[Schedule]:
        """Get pending schedules that should be posted"""
        if before_time is None:
            before_time = datetime.utcnow()
        
        result = await db.execute(
            select(Schedule)
            .where(
                and_(
                    Schedule.posting_status == PostingStatus.PENDING,
                    Schedule.scheduled_time <= before_time
                )
            )
            .order_by(Schedule.scheduled_time.asc())
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_schedules_by_date_range(
        db: AsyncSession,
        brand_id: UUID,
        start_date: datetime,
        end_date: datetime
    ) -> List[Schedule]:
        """Get schedules within a date range"""
        result = await db.execute(
            select(Schedule)
            .where(
                and_(
                    Schedule.brand_id == brand_id,
                    Schedule.scheduled_date >= start_date,
                    Schedule.scheduled_date <= end_date
                )
            )
            .order_by(Schedule.scheduled_date.asc(), Schedule.scheduled_time.asc())
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_calendar_view(
        db: AsyncSession,
        brand_id: UUID,
        month: int,
        year: int
    ) -> dict:
        """Get calendar view of schedules for a specific month"""
        from calendar import monthrange
        
        # Get first and last day of month
        _, last_day = monthrange(year, month)
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, last_day, 23, 59, 59)
        
        schedules = await ScheduleService.get_schedules_by_date_range(
            db, brand_id, start_date, end_date
        )
        
        # Group by date
        calendar_data = {}
        for schedule in schedules:
            date_key = schedule.scheduled_date.strftime('%Y-%m-%d')
            if date_key not in calendar_data:
                calendar_data[date_key] = []
            calendar_data[date_key].append(schedule)
        
        return calendar_data
    
    @staticmethod
    async def update_schedule(
        db: AsyncSession,
        schedule_id: UUID,
        schedule_data: ScheduleUpdate
    ) -> Optional[Schedule]:
        """Update schedule"""
        schedule = await ScheduleService.get_schedule_by_id(db, schedule_id)
        if not schedule:
            return None
        
        update_data = schedule_data.model_dump(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        await db.execute(
            update(Schedule)
            .where(Schedule.id == schedule_id)
            .values(**update_data)
        )
        await db.commit()
        await db.refresh(schedule)
        return schedule
    
    @staticmethod
    async def mark_as_posted(
        db: AsyncSession,
        schedule_id: UUID,
        published_url: str,
        platform_post_id: str
    ) -> Optional[Schedule]:
        """Mark schedule as successfully posted"""
        return await ScheduleService.update_schedule(
            db,
            schedule_id,
            ScheduleUpdate(
                posting_status=PostingStatus.POSTED,
                published_url=published_url,
                platform_post_id=platform_post_id
            )
        )
    
    @staticmethod
    async def mark_as_failed(
        db: AsyncSession,
        schedule_id: UUID,
        error_message: str,
        error_details: Optional[dict] = None
    ) -> Optional[Schedule]:
        """Mark schedule as failed"""
        schedule = await ScheduleService.get_schedule_by_id(db, schedule_id)
        if not schedule:
            return None
        
        new_attempt_count = schedule.attempt_count + 1
        new_status = (
            PostingStatus.FAILED 
            if new_attempt_count >= schedule.max_attempts 
            else PostingStatus.PENDING
        )
        
        return await ScheduleService.update_schedule(
            db,
            schedule_id,
            ScheduleUpdate(
                posting_status=new_status,
                error_message=error_message,
                error_details=error_details
            )
        )
    
    @staticmethod
    async def delete_schedule(db: AsyncSession, schedule_id: UUID) -> bool:
        """Delete schedule"""
        result = await db.execute(
            delete(Schedule).where(Schedule.id == schedule_id)
        )
        await db.commit()
        return result.rowcount > 0
    
    @staticmethod
    async def cancel_schedule(db: AsyncSession, schedule_id: UUID) -> Optional[Schedule]:
        """Cancel a pending schedule"""
        return await ScheduleService.update_schedule(
            db,
            schedule_id,
            ScheduleUpdate(posting_status=PostingStatus.CANCELLED)
        )
    
    @staticmethod
    async def get_schedule_stats(db: AsyncSession, brand_id: UUID) -> dict:
        """Get schedule statistics"""
        result = await db.execute(
            select(
                Schedule.posting_status,
                func.count(Schedule.id).label('count')
            )
            .where(Schedule.brand_id == brand_id)
            .group_by(Schedule.posting_status)
        )
        
        stats = {row.posting_status: row.count for row in result}
        
        # Get today's stats
        today = datetime.utcnow().date()
        today_result = await db.execute(
            select(func.count(Schedule.id))
            .where(
                and_(
                    Schedule.brand_id == brand_id,
                    func.date(Schedule.scheduled_date) == today
                )
            )
        )
        today_count = today_result.scalar() or 0
        
        return {
            'total': sum(stats.values()),
            'by_status': stats,
            'today': today_count
        }