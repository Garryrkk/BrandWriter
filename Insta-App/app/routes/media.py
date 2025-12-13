# app/routes/media.py
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_db
from sqlalchemy.orm import Session
from app.schemas import MediaCreate, MediaOut
from app.models import MediaItem

router = APIRouter()

@router.post("/register", response_model=MediaOut)
def register_media(payload: MediaCreate, db: Session = next(get_db())):
    mi = MediaItem(url=payload.url, mime_type=payload.mime_type, brand_post_id=payload.brand_post_id)
    db.add(mi); db.commit(); db.refresh(mi)
    return {"id": mi.id, "url": mi.url, "mime_type": mi.mime_type, "brand_post_id": mi.brand_post_id}
