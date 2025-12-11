from datetime import datetime
import asyncio
from app.core.config import settings
from app.db.database import AsyncSessionLocal
from app.schedule.ScheduleServices import ScheduleService
from app.brand.BrandServices import BrandService
from app.generation.GenerationServices import GenerationService
from app.services.ai_service import AIService
from app.services.rag_service import RAGService

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

scheduler = AsyncIOScheduler(timezone=settings.SCHEDULER_TIMEZONE)

ai_service = AIService()
rag_service = RAGService()


# -----------------------------------------------------
# ASYNC JOB: PROCESS PENDING POSTS
# -----------------------------------------------------
async def process_pending_posts():
    async with AsyncSessionLocal() as db:
        try:
            pending = await ScheduleService.get_pending_schedules(db)

            for schedule in pending:
                try:
                    print(f"Processing schedule {schedule.id} ({schedule.platform})")

                    await ScheduleService.mark_as_posted(
                        db,
                        schedule.id,
                        published_url=f"https://{schedule.platform}.com/post/demo",
                        platform_post_id=f"demo_{schedule.id}"
                    )

                    print(f"✓ Posted schedule {schedule.id}")

                except Exception as e:
                    print(f"✗ Error posting schedule {schedule.id}: {str(e)}")

                    await ScheduleService.mark_as_failed(
                        db,
                        schedule.id,
                        error_message=str(e),
                        error_details={"error_type": type(e).__name__}
                    )

        except Exception as e:
            print(f"Error in process_pending_posts: {str(e)}")


# -----------------------------------------------------
# ASYNC JOB: DAILY CONTENT GENERATION
# -----------------------------------------------------
async def daily_content_generation():
    async with AsyncSessionLocal() as db:
        try:
            print("Starting daily content generation...")

            brands, _ = await BrandService.get_all_brands(db, is_active=True)

            categories = [
                "newsletter",
                "linkedin_post",
                "instagram_post",
                "instagram_reel",
                "youtube_short",
                "cold_email",
                "cold_dm",
                "brand_idea",
                "lead_generation"
            ]

            counts = {
                "brand_idea": settings.DAILY_BRAND_IDEAS,
                "lead_generation": settings.DAILY_LEADS,
                "cold_email": settings.DAILY_COLD_EMAILS,
                "cold_dm": settings.DAILY_COLD_DMS,
            }

            for brand in brands:
                print(f"Generating for brand: {brand.name}")

                for category in categories:
                    count = counts.get(category, settings.DAILY_SOCIAL_POSTS_PER_PLATFORM)

                    for i in range(count):
                        rag_context = await rag_service.get_context_for_generation(
                            db, brand.id, f"{category} content", category=category
                        )

                        variations = await ai_service.generate_content(
                            brand=brand,
                            category=category,
                            topic=f"Daily {category} #{i+1}",
                            rag_context=rag_context,
                            variations=1
                        )

                        from app.schemas.generation import GenerationCreate

                        generation_data = GenerationCreate(
                            brand_id=brand.id,
                            category=category,
                            platform=None,
                            prompt=f"Daily auto-generation for {category}",
                            rag_enabled=True
                        )

                        await GenerationService.create_generation(
                            db,
                            generation_data,
                            output=variations[0] if variations else {},
                            model_used=ai_service.model,
                            generation_time=0
                        )

            print("✓ Daily content generation completed")

        except Exception as e:
            print(f"Error in daily_content_generation: {str(e)}")


# -----------------------------------------------------
# SCHEDULER STARTUP
# -----------------------------------------------------
def start_scheduler():
    scheduler.add_job(
        process_pending_posts,
        trigger=IntervalTrigger(seconds=settings.AUTO_POST_CHECK_INTERVAL),
        id="process_pending_posts",
        replace_existing=True
    )

    scheduler.add_job(
        daily_content_generation,
        trigger=CronTrigger(hour=2, minute=0),
        id="daily_content_generation",
        replace_existing=True
    )

    scheduler.start()
    print("✓ Async scheduler started")


def shutdown_scheduler():
    scheduler.shutdown()
    print("✓ Scheduler stopped")
