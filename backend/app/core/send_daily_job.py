from app.services.selector import select_daily
from app.services.sender import send_email
from app.db.database import SessionLocal
from datetime import date

def send_daily_job():
    db = SessionLocal()
    today = date.today()

    try:
        fresh, repeats = select_daily(db)

        for email in fresh:
            send_email(email.email)
            db.add(DailySend(
                email_id=email.id,
                send_date=today,
                is_repeat=False
            ))

        for email in repeats:
            send_email(email.email)
            db.add(DailySend(
                email_id=email.id,
                send_date=today,
                is_repeat=True
            ))

        db.commit()

    except Exception as e:
        db.rollback()
        print("Daily send failed:", e)

    finally:
        db.close()