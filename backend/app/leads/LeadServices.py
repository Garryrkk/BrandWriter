from sqlalchemy.orm import Session
from app.db.database import get_db
from app.leads.LeadModels import Lead
from app.leads.providers.apollo import ApolloProvider
from app.leads.providers.hunter import HunterProvider
from app.writers.email_writer import EmailWriter
from app.writers.linkedin_writer import LinkedInWriter
from app.basket.BasketServices import add_content_to_basket
from app.observability.service import log_generation

PROVIDERS = {
    "apollo": ApolloProvider(),
    "hunter": HunterProvider()
}

def collect_leads(db: Session, brand_id: str, provider_name: str, filters: dict, limit: int = 100):
    provider = PROVIDERS[provider_name]
    raw_leads = provider.fetch(filters, limit)

    saved = []
    for l in raw_leads:
        lead = Lead(
            brand_id=brand_id,
            email=l.get("email"),
            linkedin_url=l.get("linkedin_url"),
            full_name=l.get("full_name"),
            company=l.get("company"),
            title=l.get("title"),
            verified=l.get("verified", False),
            source=l.get("source")
        )
        db.add(lead)
        saved.append(lead)

    db.commit()
    return saved

def generate_cold_email(db: Session, lead: Lead, brand):
    log_generation("cold_email", lead.id)
    content = EmailWriter().generate({
        "lead": lead,
        "brand": brand,
        "intent": "cold_outreach"
    })
    return content

def generate_cold_dm(db: Session, lead: Lead, brand):
    log_generation("cold_dm", lead.id)
    content = LinkedInWriter().generate({
        "lead": lead,
        "brand": brand,
        "intent": "cold_outreach"
    })
    return content
