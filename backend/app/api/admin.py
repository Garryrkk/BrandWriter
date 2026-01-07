from fastapi import APIRouter
from app.core.collect_emails_job import collect_emails_job
from app.core.send_daily_job import send_daily_job

router = APIRouter(prefix="/admin", tags=["Admin Jobs"])

@router.post("/collect")
def collect_emails():
    collect_emails_job()
    return {"status": "email collection started"}

@router.post("/send")
def send_emails():
    send_daily_job()
    return {"status": "daily email job started"}