# app/services/scheduler_service.py
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime
from app.db import SessionLocal
from app.models import ScheduledPost, MediaItem, PostLog
from app.services.instagram_service import InstagramService

scheduler = BackgroundScheduler()

def run_post_job(scheduled_post_id: int):
    db = SessionLocal()
    try:
        post = db.query(ScheduledPost).filter(ScheduledPost.id == scheduled_post_id).first()
        if not post or post.status != "pending":
            return
        insta = InstagramService()
        # fetch media URLs
        media_ids = post.media_ids.split(",") if post.media_ids else []
        media_internal_ids = []
        for m in media_ids:
            mi = db.query(MediaItem).get(int(m))
            if not mi:
                continue
            is_video = "video" in (mi.mime_type or "")
            upload_id = insta.upload_media_from_url(mi.url, is_video=is_video)
            media_internal_ids.append(upload_id)
        # post by type
        try:
            if post.type == "post" or post.type == "carousel":
                resp = insta.post_photo(caption=post.caption or "", media_ids=media_internal_ids)
            elif post.type == "story":
                resp = insta.post_story(media_internal_ids[0], caption=post.caption or "")
            elif post.type == "reel":
                resp = insta.post_reel(media_internal_ids[0], caption=post.caption or "")
            else:
                resp = {"error": "unknown post type"}
            # log
            pl = PostLog(scheduled_post_id=post.id, external_post_id=str(resp.get("id", "")), status="posted", response=str(resp))
            db.add(pl)
            post.status = "posted"
            db.commit()
        except Exception as e:
            post.attempts += 1
            post.last_error = str(e)
            if post.attempts >= 3:
                post.status = "failed"
            db.commit()
    finally:
        db.close()

def schedule_post_job(scheduled_post_id: int, run_at: datetime):
    scheduler.add_job(run_post_job, trigger=DateTrigger(run_date=run_at), args=[scheduled_post_id], id=f"post_{scheduled_post_id}")

def start_scheduler(app=None):
    if not scheduler.running:
        scheduler.start()
