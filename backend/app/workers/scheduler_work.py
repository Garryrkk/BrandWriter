
from datetime import datetime
import asyncio
from app.core.config import settings
from app.db.database import AsyncSessionLocal
from app.schedule.ScheduleServices import ScheduleService
from app.generation.GenerationServices import GenerationService
from app.brand.BrandServices import BrandService
from app.services.ai_service import AIService
from app.services.rag_service import RAGService

scheduler = BackgroundScheduler(timezone=settings.SCHEDULER_TIMEZONE)
ai_service = AIService()
rag_service = RAGService()

async def process_pending_posts():
    """Process pending scheduled posts and attempt to publish them"""
    async with AsyncSessionLocal() as db:
        try:
            # Get pending schedules
            pending = await ScheduleService.get_pending_schedules(db)
            
            for schedule in pending:
                try:
                    print(f"Processing schedule {schedule.id} for {schedule.platform}")
                    
                    # Here you would call the appropriate platform API
                    # For now, we'll just mark as posted
                    # TODO: Implement actual platform posting
                    
                    # Example structure:
                    # if schedule.platform == "instagram":
                    #     result = await post_to_instagram(schedule)
                    # elif schedule.platform == "linkedin":
                    #     result = await post_to_linkedin(schedule)
                    # ...
                    
                    # For demo, mark as posted
                    await ScheduleService.mark_as_posted(
                        db,
                        schedule.id,
                        published_url=f"https://{schedule.platform}.com/post/demo",
                        platform_post_id=f"demo_{schedule.id}"
                    )
                    
                    print(f"✓ Posted schedule {schedule.id}")
                    
                except Exception as e:
                    print(f"✗ Error posting schedule {schedule.id}: {str(e)}")
                    
                    # Mark as failed
                    await ScheduleService.mark_as_failed(
                        db,
                        schedule.id,
                        error_message=str(e),
                        error_details={"error_type": type(e).__name__}
                    )
        
        except Exception as e:
            print(f"Error in process_pending_posts: {str(e)}")

async def daily_content_generation():
    """Generate daily content for all active brands"""
    async with AsyncSessionLocal() as db:
        try:
            print("Starting daily content generation...")
            
            # Get all active brands
            brands, _ = await BrandService.get_all_brands(db, is_active=True)
            
            for brand in brands:
                print(f"Generating content for brand: {brand.name}")
                
                # Categories to generate
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
                
                # Count per category
                counts = {
                    "brand_idea": settings.DAILY_BRAND_IDEAS,
                    "lead_generation": settings.DAILY_LEADS,
                    "cold_email": settings.DAILY_COLD_EMAILS,
                    "cold_dm": settings.DAILY_COLD_DMS,
                }
                
                for category in categories:
                    count = counts.get(category, settings.DAILY_SOCIAL_POSTS_PER_PLATFORM)
                    
                    try:
                        print(f"  Generating {count} {category} items...")
                        
                        for i in range(count):
                            # Get RAG context
                            rag_context = await rag_service.get_context_for_generation(
                                db, brand.id, f"{category} content", category=category
                            )
                            
                            # Generate content
                            variations = await ai_service.generate_content(
                                brand=brand,
                                category=category,
                                topic=f"Daily {category} content #{i+1}",
                                rag_context=rag_context,
                                variations=1
                            )
                            
                            # Save to database
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
                        
                        print(f"  ✓ Generated {count} {category} items")
                    
                    except Exception as e:
                        print(f"  ✗ Error generating {category}: {str(e)}")
                
                print(f"✓ Completed generation for {brand.name}")
        
        except Exception as e:
            print(f"Error in daily_content_generation: {str(e)}")

def sync_process_pending_posts():
    """Synchronous wrapper for async post processing"""
    asyncio.run(process_pending_posts())

def sync_daily_content_generation():
    """Synchronous wrapper for async content generation"""
    asyncio.run(daily_content_generation())

def start_scheduler():
    """Start the background scheduler"""
    # Check pending posts every minute
    scheduler.add_job(
        sync_process_pending_posts,
        trigger=IntervalTrigger(seconds=settings.AUTO_POST_CHECK_INTERVAL),
        id="process_pending_posts",
        name="Process pending scheduled posts",
        replace_existing=True
    )
    
    # Generate daily content at 2 AM
    scheduler.add_job(
        sync_daily_content_generation,
        trigger=CronTrigger(hour=2, minute=0),
        id="daily_content_generation",
        name="Daily content generation",
        replace_existing=True
    )
    
    scheduler.start()
    print("✓ Background scheduler started")

def shutdown_scheduler():
    """Shutdown the scheduler"""
    scheduler.shutdown()
    print("✓ Background scheduler stopped")