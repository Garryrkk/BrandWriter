from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import init_db
from app.routes import (
    brand_routes,
    draft_routes,
    basket_routes,
    schedule_routes,
    generation_routes
)

# Import worker
from app.workers.scheduler_worker import start_scheduler, shutdown_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown"""
    # Startup
    print("🚀 Starting Content OS...")
    
    # Initialize database
    await init_db()
    print("✓ Database initialized")
    
    # Start background scheduler
    start_scheduler()
    print("✓ Scheduler started")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Content OS...")
    shutdown_scheduler()
    print("✓ Scheduler stopped")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Automated Content OS for Brand Content Generation and Scheduling",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(brand_routes.router, prefix="/api/v1")
app.include_router(draft_routes.router, prefix="/api/v1")
app.include_router(basket_routes.router, prefix="/api/v1")
app.include_router(schedule_routes.router, prefix="/api/v1")
app.include_router(generation_routes.router, prefix="/api/v1")

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# Dashboard stats endpoint
@app.get("/api/v1/dashboard/stats")
async def get_dashboard_stats():
    """Get overall dashboard statistics"""
    from app.database import get_db
    from app.services.brand_service import BrandService
    from app.services.draft_service import DraftService
    from app.services.basket_service import BasketService
    from app.services.schedule_service import ScheduleService
    from app.services.generation_service import GenerationService
    
    async with get_db() as db:
        # Get active brand
        brand = await BrandService.get_active_brand(db)
        if not brand:
            return {"error": "No active brand found"}
        
        # Get stats from all services
        draft_stats = await DraftService.get_draft_count_by_category(db, brand.id)
        basket_stats = await BasketService.get_basket_stats(db, brand.id)
        schedule_stats = await ScheduleService.get_schedule_stats(db, brand.id)
        generation_stats = await GenerationService.get_generation_stats(db, brand.id)
        
        return {
            "brand": {
                "id": str(brand.id),
                "name": brand.name
            },
            "drafts": draft_stats,
            "basket": basket_stats,
            "schedules": schedule_stats,
            "generations": generation_stats
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )