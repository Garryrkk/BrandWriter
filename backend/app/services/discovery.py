from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.services.normalization import normalize_text
from app.services.matching import contains_exclusion
from app.services.scoring import score_lead
from app.services.duplication import should_surface


def ingest_raw_lead(db: Session, raw: dict):
    text = normalize_text(
        f"{raw.get('headline','')} {raw.get('role','')}"
    )

    if contains_exclusion(text):
        return None

    score, bucket = score_lead(text)

    if score < 60:
        return None

    lead = db.get(Lead, raw["profile_url"])

    if lead:
        if should_surface(lead.last_seen):
            lead.times_seen += 1
        return None

    new_lead = Lead(
        profile_url=raw["profile_url"],
        full_name=raw.get("full_name"),
        role=raw.get("role"),
        company=raw.get("company"),
        headline=raw.get("headline"),
        score=score,
        bucket=bucket
    )

    db.add(new_lead)
    return new_lead
