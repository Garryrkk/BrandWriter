from fastapi import APIRouter, Query
from typing import Optional
from app.observability.service import get_logs, get_logs_by_platform

router = APIRouter(prefix="/logs", tags=["Observability"])


@router.get("/posting/{schedule_id}")
def posting_logs(schedule_id: str):
    """
    Get all posting logs for a specific schedule.
    """
    return get_logs(schedule_id)


@router.get("/platform/{platform}")
def platform_logs(
    platform: str,
    limit: int = Query(default=50, le=500),
    status: Optional[str] = None
):
    """
    Get logs for a specific platform.
    """
    return get_logs_by_platform(platform, limit, status)


@router.get("/health")
def observability_health():
    """
    Health check for the observability system.
    """
    return {"status": "healthy", "service": "observability"}
