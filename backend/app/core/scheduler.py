from apscheduler.schedulers.background import BackgroundScheduler
from app.core.send_daily_job import send_daily_job

def start_scheduler(app):
    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=send_daily_job,
        trigger="cron",
        hour=10
    )
    scheduler.start()