from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.lead import Lead

router = APIRouter(prefix="/leads", tags=["Leads"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/")
def get_leads(db: Session = Depends(get_db)):
    return db.query(Lead).order_by(Lead.score.desc()).all()
