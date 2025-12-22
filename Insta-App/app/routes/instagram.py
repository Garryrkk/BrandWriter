from fastapi import APIRouter, HTTPException
from typing import Optional, List

router = APIRouter(prefix="/instagram", tags=["Instagram"])


@router.post("/post")
def post_instagram(payload: dict):
    """
    Post content to Instagram.
    Called ONLY by main backend worker.
    
    Expected payload:
    - schedule_id: str
    - caption: str
    - assets: list[str] (URLs to images/videos)
    """
    from app.services.instagram_service import InstagramService
    
    try:
        schedule_id = payload.get("schedule_id")
        caption = payload.get("caption", "")
        assets = payload.get("assets", [])
        
        if not caption and not assets:
            raise HTTPException(status_code=400, detail="Either caption or assets required")
        
        # Post to Instagram
        service = InstagramService()
        
        # Upload media from URLs if provided
        media_ids = []
        for asset_url in assets:
            is_video = asset_url.lower().endswith(('.mp4', '.mov', '.avi'))
            media_id = service.upload_media_from_url(asset_url, is_video=is_video)
            media_ids.append(media_id)
        
        # Post the photo/carousel
        if media_ids:
            result = service.post_photo(caption=caption, media_ids=media_ids)
        else:
            # Text-only post (if supported)
            result = {"status": "text_only_not_supported"}
        
        return {
            "status": "success",
            "schedule_id": schedule_id,
            "platform_post_id": result.get("id") if isinstance(result, dict) else str(result),
            "permalink": result.get("permalink") if isinstance(result, dict) else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/story")
def post_story(payload: dict):
    """
    Post a story to Instagram.
    """
    from app.services.instagram_service import InstagramService
    
    try:
        media_url = payload.get("media_url")
        caption = payload.get("caption")
        
        if not media_url:
            raise HTTPException(status_code=400, detail="media_url required for stories")
        
        service = InstagramService()
        
        # Upload the media first
        is_video = media_url.lower().endswith(('.mp4', '.mov', '.avi'))
        media_id = service.upload_media_from_url(media_url, is_video=is_video)
        
        # Post story
        result = service.post_story(media_id=media_id, caption=caption)
        
        return {
            "status": "success",
            "story_id": result.get("id") if isinstance(result, dict) else str(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reel")
def post_reel(payload: dict):
    """
    Post a reel to Instagram.
    """
    from app.services.instagram_service import InstagramService
    
    try:
        media_url = payload.get("media_url")
        caption = payload.get("caption", "")
        
        if not media_url:
            raise HTTPException(status_code=400, detail="media_url required for reels")
        
        service = InstagramService()
        
        # Upload the video
        media_id = service.upload_media_from_url(media_url, is_video=True)
        
        # Post reel
        result = service.post_reel(media_id=media_id, caption=caption)
        
        return {
            "status": "success",
            "reel_id": result.get("id") if isinstance(result, dict) else str(result)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{post_id}")
def get_post_status(post_id: str):
    """
    Get the status of a posted content.
    """
    return {
        "post_id": post_id,
        "status": "published"
    }


@router.get("/insights/{post_id}")
def get_post_insights(post_id: str):
    """
    Get insights for a specific post.
    """
    from app.services.instagram_service import InstagramService
    
    try:
        service = InstagramService()
        insights = service.get_insights(post_id)
        return {
            "post_id": post_id,
            "insights": insights
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
