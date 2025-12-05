from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.db.database import get_db
from app.schedule.ScheduleSchemas import (
    ScheduleCreate, ScheduleUpdate, ScheduleResponse, ScheduleListResponse,
    ScheduleCreateFromBasket, ScheduleFilter, PostingStatus, ScheduleCalendarResponse
)
from app.schedule.ScheduleServices import ScheduleService

router = APIRouter(prefix="/schedules", tags=["schedules"])

@router.post("/", response_model=ScheduleResponse, status_code=201)
async def create_schedule(
    schedule_data: ScheduleCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new schedule"""
    schedule = await ScheduleService.create_schedule(db, schedule_data)
    return schedule

@router.post("/from-basket", response_model=ScheduleResponse, status_code=201)
async def create_schedule_from_basket(
    brand_id: UUID = Query(...),
    data: ScheduleCreateFromBasket = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create schedule from basket item"""
    schedule = await ScheduleService.create_from_basket(db, brand_id, data)
    if not schedule:
        raise HTTPException(status_code=404, detail="Basket item not found")
    return schedule

@router.get("/", response_model=ScheduleListResponse)
async def get_schedules(
    brand_id: UUID = Query(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    platform: Optional[str] = None,
    posting_status: Optional[PostingStatus] = None,
    category: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all schedules with filters"""
    filters = ScheduleFilter(
        platform=platform,
        posting_status=posting_status,
        category=category,
        from_date=from_date,
        to_date=to_date
    )
    
    skip = (page - 1) * page_size
    schedules, total = await ScheduleService.get_schedules_by_brand(
        db, brand_id, skip, page_size, filters
    )
    
    return {
        "schedules": schedules,
        "total": total,
        "page": page,
        "page_size": page_size
    }

@router.get("/pending", response_model=list[ScheduleResponse])
async def get_pending_schedules(
    db: AsyncSession = Depends(get_db)
):
    """Get pending schedules that need to be posted"""
    schedules = await ScheduleService.get_pending_schedules(db)
    return schedules

@router.get("/calendar", response_model=dict)
async def get_calendar_view(
    brand_id: UUID = Query(...),
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2020, le=2100),
    db: AsyncSession = Depends(get_db)
):
    """Get calendar view of schedules"""
    calendar_data = await ScheduleService.get_calendar_view(db, brand_id, month, year)
    return calendar_data

@router.get("/stats", response_model=dict)
async def get_schedule_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get schedule statistics"""
    stats = await ScheduleService.get_schedule_stats(db, brand_id)
    return stats

@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get schedule by ID"""
    schedule = await ScheduleService.get_schedule_by_id(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.patch("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: UUID,
    schedule_data: ScheduleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update schedule"""
    schedule = await ScheduleService.update_schedule(db, schedule_id, schedule_data)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.post("/{schedule_id}/cancel", response_model=ScheduleResponse)
async def cancel_schedule(
    schedule_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Cancel a pending schedule"""
    schedule = await ScheduleService.cancel_schedule(db, schedule_id)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.delete("/{schedule_id}", status_code=204)
async def delete_schedule(
    schedule_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete schedule"""
    success = await ScheduleService.delete_schedule(db, schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return None