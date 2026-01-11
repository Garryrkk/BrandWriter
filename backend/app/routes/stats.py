from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from datetime import datetime
from app.schemas.stats import DailyStatsOut

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("/{date}", response_model=DailyStatsOut)
async def daily_stats(date: str, db: AsyncSession = Depends(get_db)):
    """Get daily email send statistics"""
    try:
        send_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    result = await db.execute(
        select(DailySend, Email)
        .join(Email, Email.id == DailySend.email_id)
        .where(DailySend.send_date == send_date)
    )
    results = result.all()

    emails = []
    new_count = 0
    repeat_count = 0

    for daily, email in results:
        emails.append({
            "email": email.email,
            "repeat": daily.is_repeat
        })
        if daily.is_repeat:
            repeat_count += 1
        else:
            new_count += 1

    return DailyStatsOut(
        date=date,
        total=len(results),
        new=new_count,
        repeated=repeat_count,
        emails=emails
    )