"""
Posting worker - handles the actual posting to platforms.
"""
import time
import httpx
from typing import Optional
from app.core.config import settings


def log_post_attempt(schedule_id: str, platform: str, fn):
    """
    Wrapper to log posting attempts with timing and error handling.
    """
    start = time.time()
    try:
        result = fn()
        latency = int((time.time() - start) * 1000)
        save_log(schedule_id, platform, "success", None, latency)
        return result
    except Exception as e:
        latency = int((time.time() - start) * 1000)
        save_log(schedule_id, platform, "failed", str(e), latency)
        raise


def save_log(schedule_id: str, platform: str, status: str, error: Optional[str], latency_ms: int):
    """
    Save posting log to the observability system.
    """
    # Import here to avoid circular imports
    from app.observability.service import create_log
    
    create_log({
        "schedule_id": schedule_id,
        "platform": platform,
        "status": status,
        "error": error,
        "latency_ms": latency_ms,
        "timestamp": time.time()
    })


async def run_schedule(schedule_id: str):
    """
    Execute a scheduled post.
    1. Fetch schedule from database
    2. Check idempotency key
    3. Call appropriate platform service
    4. Log result
    """
    from app.schedule.ScheduleServices import ScheduleService
    from app.db.database import get_db
    
    async with get_db() as db:
        # Get the schedule
        schedule = await ScheduleService.get_schedule(db, schedule_id)
        if not schedule:
            raise ValueError(f"Schedule {schedule_id} not found")
        
        # Check if already processed (idempotency)
        if schedule.status == "completed":
            return {"status": "already_processed", "schedule_id": schedule_id}
        
        platform = schedule.platform.lower()
        
        # Route to appropriate platform service
        if platform == "instagram":
            result = await post_to_instagram(schedule)
        elif platform == "linkedin":
            result = await post_to_linkedin(schedule)
        elif platform == "email":
            result = await send_email(schedule)
        else:
            raise ValueError(f"Unsupported platform: {platform}")
        
        # Update schedule status
        await ScheduleService.update_schedule_status(db, schedule_id, "completed", result)
        
        return result


async def post_to_instagram(schedule):
    """
    Post to Instagram via the Insta-App microservice.
    """
    insta_app_url = getattr(settings, 'INSTA_APP_URL', 'http://localhost:8001')
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{insta_app_url}/instagram/post",
            json={
                "schedule_id": str(schedule.id),
                "content": schedule.frozen_content,
                "assets": schedule.frozen_assets or [],
                "caption": schedule.frozen_content,
            },
            timeout=60.0
        )
        response.raise_for_status()
        return response.json()


async def post_to_linkedin(schedule):
    """
    Post to LinkedIn.
    """
    # TODO: Implement LinkedIn posting
    return {"status": "not_implemented", "platform": "linkedin"}


async def send_email(schedule):
    """
    Send email content.
    """
    # TODO: Implement email sending
    return {"status": "not_implemented", "platform": "email"}
