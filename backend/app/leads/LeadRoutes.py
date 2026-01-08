from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.leads.LeadSchemas import LeadCreate, LeadResponse
from app.leads.LeadServices import collect_leads, generate_cold_email, generate_cold_dm
from app.leads.LeadModels import Lead
from app.brand.BrandServices import get_brand_by_user

router = APIRouter(prefix="/leads", tags=["Leads"])

@router.post("/fetch")
def fetch_leads(
    provider: str,
    filters: dict,
    limit: int = 100,
    db: Session = Depends(get_db),
    user=Depends(get_brand_by_user)
):
    return collect_leads(db, user.id, provider, filters, limit)

@router.post("/{lead_id}/email")
def write_email(
    lead_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_brand_by_user)
):
    lead = db.query(Lead).get(lead_id)
    return generate_cold_email(db, lead, user)

@router.post("/{lead_id}/dm")
def write_dm(
    lead_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_brand_by_user)
):
    lead = db.query(Lead).get(lead_id)
    return generate_cold_dm(db, lead, user)
