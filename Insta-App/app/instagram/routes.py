from fastapi import APIRouter, HTTPException
from app.instagram.schemas import (
    InstagramPostRequest,
    InstagramPostResponse,
)
from app.instagram.service import InstagramService

router = APIRouter(prefix="/instagram", tags=["Instagram"])


@router.post("/post", response_model=InstagramPostResponse)
async def post_to_instagram(payload: InstagramPostRequest):
    try:
        result = await InstagramService.handle_post(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
