# app/api/routes/ingest.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.ingest_service import ingest_raw_text_for_brand
import httpx

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/admin/scrape-seed/{brand_id}")
def admin_scrape_seed(brand_id: int, db: Session = Depends(get_db)):
    """
    Protected endpoint (add auth / admin check). This function is a placeholder:
    - it runs your prebuilt scrapers (or reads local seed files) and calls ingest_raw_text_for_brand.
    """
    # Example: load seed corpus from local folder or remote storage
    import os, glob
    seed_dir = "app/templates/seed_corpora"
    if not os.path.exists(seed_dir):
        raise HTTPException(400, "No seed corpus folder found.")
    ingested = []
    for path in glob.glob(f"{seed_dir}/*.txt"):
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        docs = ingest_raw_text_for_brand(brand_id=brand_id, source=os.path.basename(path), text=text, db=db)
        ingested.append({"source": os.path.basename(path), "count": len(docs)})
    return {"ingested": ingested}
