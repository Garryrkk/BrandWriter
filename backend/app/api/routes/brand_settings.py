# app/api/routes/brand_settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.brand import Brand
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BrandSettingsIn(BaseModel):
    use_rag: bool = True
    use_lora: bool = False
    tone_preset: str = None

@router.post("/brands/{brand_id}/settings")
def set_brand_settings(brand_id: int, payload: BrandSettingsIn, db: Session = Depends(get_db)):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()
    if not brand:
        raise HTTPException(404, "Brand not found")
    brand.use_rag = payload.use_rag
    brand.use_lora = payload.use_lora
    brand.tone_preset = payload.tone_preset
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return {"message": "updated", "brand_id": brand.id}
