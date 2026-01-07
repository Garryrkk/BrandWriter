from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.db.database import get_db
from app.history.HistoryModels import HistoryStatus
from app.history.HistoryService import HistoryService
from pydantic import BaseModel, ConfigDict

router = APIRouter(prefix="/history", tags=["history"])

# Response Schemas
class HistoryResponse(BaseModel):
    id: UUID
    brand_id: UUID
    category: str
    platform: str
    title: Optional[str] = None
    content: dict
    raw_prompt: Optional[str] = None
    model_used: Optional[str] = None
    variation: Optional[str] = None
    rag_documents_used: Optional[List[str]] = None
    metadata: Optional[dict] = None
    tone: Optional[str] = None
    asset_urls: Optional[dict] = None
    status: HistoryStatus
    published_url: Optional[str] = None
    engagement_metrics: Optional[dict] = None
    impression_count: int
    click_count: int
    conversion_count: int
    draft_id: Optional[UUID] = None
    basket_id: Optional[UUID] = None
    schedule_id: Optional[UUID] = None
    generated_at: datetime
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class HistoryListResponse(BaseModel):
    history: List[HistoryResponse]
    total: int
    page: int
    page_size: int

class EngagementMetricsUpdate(BaseModel):
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    views: Optional[int] = None
    clicks: Optional[int] = None
    saves: Optional[int] = None

class HistoryCreate(BaseModel):
    brand_id: UUID
    category: str
    platform: str
    title: Optional[str] = None
    content: dict
    raw_prompt: Optional[str] = None
    model_used: Optional[str] = None
    variation: Optional[str] = None
    rag_documents_used: Optional[List[str]] = None
    metadata: Optional[dict] = None
    tone: Optional[str] = None
    asset_urls: Optional[dict] = None
    status: HistoryStatus = HistoryStatus.GENERATED


@router.post("/", response_model=HistoryResponse, status_code=201)
async def create_history_entry(
    data: HistoryCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new history entry"""
    history = await HistoryService.create_history_entry(
        db=db,
        brand_id=data.brand_id,
        category=data.category,
        platform=data.platform,
        content=data.content,
        title=data.title,
        raw_prompt=data.raw_prompt,
        model_used=data.model_used,
        variation=data.variation,
        rag_documents_used=data.rag_documents_used,
        metadata=data.metadata,
        tone=data.tone,
        asset_urls=data.asset_urls,
        status=data.status
    )
    return history


@router.get("/", response_model=HistoryListResponse)
async def get_history(
    brand_id: UUID = Query(..., description="Brand ID"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    platform: Optional[str] = None,
    status: Optional[HistoryStatus] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get history entries with filters"""
    skip = (page - 1) * page_size
    entries, total = await HistoryService.get_history_by_brand(
        db=db,
        brand_id=brand_id,
        skip=skip,
        limit=page_size,
        category=category,
        platform=platform,
        status=status,
        from_date=from_date,
        to_date=to_date
    )
    
    return {
        "history": entries,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/published", response_model=List[HistoryResponse])
async def get_published_content(
    brand_id: UUID = Query(...),
    platform: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Get published content"""
    entries = await HistoryService.get_published_content(
        db=db,
        brand_id=brand_id,
        platform=platform,
        limit=limit
    )
    return entries


@router.get("/performance", response_model=List[HistoryResponse])
async def get_content_performance(
    brand_id: UUID = Query(...),
    days: int = Query(30, ge=1, le=365, description="Number of days to look back"),
    db: AsyncSession = Depends(get_db)
):
    """Get content performance with engagement metrics"""
    entries = await HistoryService.get_content_performance(
        db=db,
        brand_id=brand_id,
        days=days
    )
    return entries


@router.get("/top-performing", response_model=List[HistoryResponse])
async def get_top_performing_content(
    brand_id: UUID = Query(...),
    metric: str = Query("likes", description="Metric to sort by: likes, comments, shares, views"),
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db)
):
    """Get top performing content by specific metric"""
    entries = await HistoryService.get_top_performing_content(
        db=db,
        brand_id=brand_id,
        metric=metric,
        limit=limit,
        days=days
    )
    return entries


@router.get("/stats", response_model=dict)
async def get_history_stats(
    brand_id: UUID = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """Get history statistics"""
    stats = await HistoryService.get_history_stats(db, brand_id)
    return stats


@router.get("/{history_id}", response_model=HistoryResponse)
async def get_history_entry(
    history_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get history entry by ID"""
    history = await HistoryService.get_history_by_id(db, history_id)
    if not history:
        raise HTTPException(status_code=404, detail="History entry not found")
    return history


@router.post("/{history_id}/mark-published", response_model=HistoryResponse)
async def mark_as_published(
    history_id: UUID,
    published_url: str = Query(..., description="URL of published content"),
    published_at: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """Mark content as published"""
    history = await HistoryService.mark_as_published(
        db=db,
        history_id=history_id,
        published_url=published_url,
        published_at=published_at
    )
    if not history:
        raise HTTPException(status_code=404, detail="History entry not found")
    return history


@router.patch("/{history_id}/engagement", response_model=HistoryResponse)
async def update_engagement_metrics(
    history_id: UUID,
    metrics: EngagementMetricsUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update engagement metrics for published content"""
    # Convert to dict and remove None values
    metrics_dict = {k: v for k, v in metrics.model_dump().items() if v is not None}
    
    if not metrics_dict:
        raise HTTPException(status_code=400, detail="No metrics provided")
    
    history = await HistoryService.update_engagement_metrics(
        db=db,
        history_id=history_id,
        metrics=metrics_dict
    )
    if not history:
        raise HTTPException(status_code=404, detail="History entry not found")
    return history


@router.delete("/{history_id}", status_code=204)
async def delete_history_entry(
    history_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete history entry"""
    success = await HistoryService.delete_history(db, history_id)
    if not success:
        raise HTTPException(status_code=404, detail="History entry not found")
    return None


# Analytics Endpoints

@router.get("/analytics/engagement-trends", response_model=dict)
async def get_engagement_trends(
    brand_id: UUID = Query(...),
    days: int = Query(30, ge=7, le=365),
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get engagement trends over time"""
    entries = await HistoryService.get_content_performance(
        db=db,
        brand_id=brand_id,
        days=days
    )
    
    if platform:
        entries = [e for e in entries if e.platform == platform]
    
    # Calculate trends
    total_likes = sum(e.engagement_metrics.get('likes', 0) for e in entries if e.engagement_metrics)
    total_comments = sum(e.engagement_metrics.get('comments', 0) for e in entries if e.engagement_metrics)
    total_shares = sum(e.engagement_metrics.get('shares', 0) for e in entries if e.engagement_metrics)
    total_views = sum(e.engagement_metrics.get('views', 0) for e in entries if e.engagement_metrics)
    
    avg_engagement_rate = 0
    if total_views > 0:
        avg_engagement_rate = ((total_likes + total_comments + total_shares) / total_views) * 100
    
    return {
        "period_days": days,
        "total_posts": len(entries),
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_views": total_views,
        "avg_engagement_rate": round(avg_engagement_rate, 2),
        "avg_likes_per_post": round(total_likes / len(entries), 2) if entries else 0,
        "avg_comments_per_post": round(total_comments / len(entries), 2) if entries else 0,
        "avg_shares_per_post": round(total_shares / len(entries), 2) if entries else 0
    }


@router.get("/analytics/by-platform", response_model=dict)
async def get_analytics_by_platform(
    brand_id: UUID = Query(...),
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db)
):
    """Get performance analytics grouped by platform"""
    entries = await HistoryService.get_content_performance(
        db=db,
        brand_id=brand_id,
        days=days
    )
    
    platform_stats = {}
    for entry in entries:
        platform = entry.platform
        if platform not in platform_stats:
            platform_stats[platform] = {
                "count": 0,
                "total_likes": 0,
                "total_comments": 0,
                "total_shares": 0,
                "total_views": 0
            }
        
        platform_stats[platform]["count"] += 1
        if entry.engagement_metrics:
            platform_stats[platform]["total_likes"] += entry.engagement_metrics.get('likes', 0)
            platform_stats[platform]["total_comments"] += entry.engagement_metrics.get('comments', 0)
            platform_stats[platform]["total_shares"] += entry.engagement_metrics.get('shares', 0)
            platform_stats[platform]["total_views"] += entry.engagement_metrics.get('views', 0)
    
    # Calculate averages
    for platform, stats in platform_stats.items():
        count = stats["count"]
        stats["avg_likes"] = round(stats["total_likes"] / count, 2) if count else 0
        stats["avg_comments"] = round(stats["total_comments"] / count, 2) if count else 0
        stats["avg_shares"] = round(stats["total_shares"] / count, 2) if count else 0
        stats["avg_views"] = round(stats["total_views"] / count, 2) if count else 0
        
        # Engagement rate
        if stats["total_views"] > 0:
            engagement = stats["total_likes"] + stats["total_comments"] + stats["total_shares"]
            stats["engagement_rate"] = round((engagement / stats["total_views"]) * 100, 2)
        else:
            stats["engagement_rate"] = 0
    
    return platform_stats


@router.get("/analytics/by-category", response_model=dict)
async def get_analytics_by_category(
    brand_id: UUID = Query(...),
    days: int = Query(30, ge=7, le=365),
    db: AsyncSession = Depends(get_db)
):
    """Get performance analytics grouped by content category"""
    entries = await HistoryService.get_content_performance(
        db=db,
        brand_id=brand_id,
        days=days
    )
    
    category_stats = {}
    for entry in entries:
        category = entry.category
        if category not in category_stats:
            category_stats[category] = {
                "count": 0,
                "total_engagement": 0,
                "posts": []
            }
        
        category_stats[category]["count"] += 1
        if entry.engagement_metrics:
            engagement = (
                entry.engagement_metrics.get('likes', 0) +
                entry.engagement_metrics.get('comments', 0) +
                entry.engagement_metrics.get('shares', 0)
            )
            category_stats[category]["total_engagement"] += engagement
            category_stats[category]["posts"].append({
                "id": str(entry.id),
                "title": entry.title,
                "engagement": engagement,
                "published_at": entry.published_at.isoformat() if entry.published_at else None
            })
    
    # Sort posts by engagement and calculate averages
    for category, stats in category_stats.items():
        stats["posts"] = sorted(stats["posts"], key=lambda x: x["engagement"], reverse=True)[:5]
        stats["avg_engagement"] = round(stats["total_engagement"] / stats["count"], 2) if stats["count"] else 0
    
    return category_stats