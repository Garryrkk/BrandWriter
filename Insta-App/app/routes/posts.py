# app/routes/posts.py
from fastapi import APIRouter, Depends, HTTPException, Header
from app.db import get_db
from sqlalchemy.orm import Session
from app.schemas import ScheduleCreate, ScheduleOut
from app.models import ScheduledPost
from app.services.scheduler_service import schedule_post_job, run_post_job
import os

router = APIRouter()

API_KEY = os.getenv("INSTA_SERVICE_API_KEY")

def check_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

@router.post("/schedule", response_model=ScheduleOut)
def schedule_post(payload: ScheduleCreate, x_api_key: str = Header(None), db: Session = next(get_db())):
    check_api_key(x_api_key)
    # find account
    from app.models import InstagramAccount
    acc = db.query(InstagramAccount).filter(InstagramAccount.username == payload.account_username).first()
    if not acc:
        raise HTTPException(status_code=404, detail="account not found")
    sp = ScheduledPost(account_id=acc.id, caption=payload.caption, type=payload.type,
                       media_ids=",".join([str(x) for x in payload.media_ids]),
                       scheduled_at=payload.scheduled_at)
    db.add(sp); db.commit(); db.refresh(sp)
    # schedule job
    schedule_post_job(sp.id, payload.scheduled_at)
    return {"id": sp.id, "status": sp.status, "scheduled_at": sp.scheduled_at}

@router.post("/post-now")
def post_now(payload: ScheduleCreate, x_api_key: str = Header(None), db: Session = next(get_db())):
    check_api_key(x_api_key)
    # create ScheduledPost record and run immediately (but outside scheduler)
    from app.models import InstagramAccount
    acc = db.query(InstagramAccount).filter(InstagramAccount.username == payload.account_username).first()
    if not acc:
        raise HTTPException(status_code=404, detail="account not found")
    sp = ScheduledPost(account_id=acc.id, caption=payload.caption, type=payload.type,
                       media_ids=",".join([str(x) for x in payload.media_ids]),
                       scheduled_at=payload.scheduled_at)
    db.add(sp); db.commit(); db.refresh(sp)
    # call job directly
    run_post_job(sp.id)
    return {"id": sp.id, "status": sp.status}
