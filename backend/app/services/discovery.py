from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.services.normalization import normalize_text
from app.services.matching import contains_exclusion
from app.services.scoring import score_lead
from app.services.duplication import should_surface

# Import the account loader
from app.services.account_loader import AccountLoader


# Initialize the loader
account_loader = AccountLoader()

# Fetch active accounts
active_accounts = account_loader.get_active_accounts()

# For now, just pick the first active account (can be looped later)
if active_accounts:
    active_account = active_accounts[0]
    # Make metadata available
    ACCOUNT_INTERNAL_ID = active_account.internal_id
    ACCOUNT_LINKEDIN_URL = active_account.profile_url
    ACCOUNT_COOKIES_PATH = active_account.cookies_path
    ACCOUNT_DAILY_PROFILE_LIMIT = active_account.daily_profile_limit
    ACCOUNT_DAILY_DM_LIMIT = active_account.daily_dm_limit
else:
    # No active account found
    ACCOUNT_INTERNAL_ID = None
    ACCOUNT_LINKEDIN_URL = None
    ACCOUNT_COOKIES_PATH = None
    ACCOUNT_DAILY_PROFILE_LIMIT = 0
    ACCOUNT_DAILY_DM_LIMIT = 0


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
