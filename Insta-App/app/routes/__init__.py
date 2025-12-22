# app/routes/__init__.py
from app.routes.auth import router as auth_router
from app.routes.posts import router as posts_router
from app.routes.media import router as media_router

__all__ = ["auth_router", "posts_router", "media_router"]
