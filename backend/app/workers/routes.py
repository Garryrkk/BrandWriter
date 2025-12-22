from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional

router = APIRouter(prefix="/workers", tags=["Workers"])


@router.post("/run/{schedule_id}")
async def run_now(schedule_id: str, background_tasks: BackgroundTasks):
    """
    Manually trigger a scheduled post to run immediately.
    Useful for testing or manual overrides.
    """
    from app.workers.posting_worker import run_schedule
    
    try:
        # Run in background to not block the request
        background_tasks.add_task(run_schedule, schedule_id)
        return {"status": "started", "schedule_id": schedule_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{schedule_id}")
async def get_worker_status(schedule_id: str):
    """
    Get the current status of a scheduled job.
    """
    # This would check the schedule status from the database
    return {"schedule_id": schedule_id, "status": "pending"}
