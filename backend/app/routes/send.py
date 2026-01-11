from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.schemas.send import SendDailyOut
from datetime import date, datetime
import random

router = APIRouter(prefix="/send", tags=["Email Sending"])

DAILY_LIMIT = 100
REPEAT_MIN = 10
REPEAT_MAX = 15

@router.post("/daily", response_model=SendDailyOut)
async def send_daily(db: AsyncSession = Depends(get_db)):
    """Select and queue daily emails for sending"""
    try:
        today = date.today()
        
        # Get emails that have been sent before
        sent_result = await db.execute(
            select(Email).join(DailySend, Email.id == DailySend.email_id)
        )
        sent_emails = list(sent_result.scalars().all())
        
        # Get emails that have never been sent
        unsent_result = await db.execute(
            select(Email).where(
                ~Email.id.in_(
                    select(DailySend.email_id).where(DailySend.email_id.isnot(None))
                )
            )
        )
        unsent_emails = list(unsent_result.scalars().all())
        
        # Calculate how many to repeat
        repeat_count = min(
            random.randint(REPEAT_MIN, REPEAT_MAX),
            len(sent_emails)
        )
        
        # Select random samples
        repeats = random.sample(sent_emails, repeat_count) if sent_emails else []
        fresh_count = min(DAILY_LIMIT - repeat_count, len(unsent_emails))
        fresh = random.sample(unsent_emails, fresh_count) if unsent_emails else []
        
        # Create DailySend records
        for email in fresh:
            daily_send = DailySend(
                email_id=email.id,
                send_date=today,
                is_repeat=False
            )
            db.add(daily_send)
        
        for email in repeats:
            daily_send = DailySend(
                email_id=email.id,
                send_date=today,
                is_repeat=True
            )
            db.add(daily_send)
        
        await db.commit()
        
        return SendDailyOut(
            sent=len(fresh) + len(repeats),
            new=len(fresh),
            repeated=len(repeats)
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pending")
async def get_pending_sends(db: AsyncSession = Depends(get_db)):
    """Get pending emails to be sent today"""
    today = date.today()
    result = await db.execute(
        select(DailySend, Email)
        .join(Email, Email.id == DailySend.email_id)
        .where(DailySend.send_date == today)
        .where(DailySend.is_sent == False)
    )
    pending = result.all()
    
    return {
        "date": str(today),
        "pending_count": len(pending),
        "emails": [{"id": str(ds.id), "email": e.email, "is_repeat": ds.is_repeat} for ds, e in pending]
    }