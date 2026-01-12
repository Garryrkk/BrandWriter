from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.services.account_loader import AccountLoader
from app.services.discovery import ingest_raw_lead
from sqlalchemy.orm import Session
from fastapi import Depends
from app.db.database import get_db

router = APIRouter()
loader = AccountLoader()

# -------------------------------
# Endpoint 1: Get all active accounts
# -------------------------------
@router.get("/accounts/active", response_model=List[Dict])
def get_active_accounts():
    accounts = loader.get_active_accounts()
    return [
        {
            "internal_id": acc.internal_id,
            "profile_url": acc.profile_url,
            "daily_profile_limit": acc.daily_profile_limit,
            "daily_dm_limit": acc.daily_dm_limit,
            "last_verified": acc.last_verified,
            "status": acc.status
        }
        for acc in accounts
    ]


# -------------------------------
# Endpoint 2: Trigger discovery for one account
# -------------------------------
@router.post("/discovery/run/{internal_id}")
def run_discovery(internal_id: str, db: Session = Depends(get_db)):
    # Fetch account metadata
    account = loader.get_account(internal_id)
    if not account or not account.is_active():
        raise HTTPException(status_code=400, detail="Account not active or not found")

    # -------------------------------
    # Here you would call your worker
    # -------------------------------
    # Example placeholder: pass cookies path and limits to worker
    # Worker returns a list of raw profiles (as dictionaries)
    # For now, we'll simulate with empty list
    raw_profiles = []  # Replace with: run_worker(account)

    # Ingest profiles into DB
    discovered_leads = []
    for raw in raw_profiles:
        lead = ingest_raw_lead(db, raw)
        if lead:
            discovered_leads.append(lead)

    db.commit()

    # Update account metadata after discovery
    from datetime import datetime
    account.last_verified = datetime.utcnow().isoformat()
    # Optionally, you can track daily profile count
    loader.save_accounts()

    return {
        "internal_id": account.internal_id,
        "profile_url": account.profile_url,
        "daily_profile_limit": account.daily_profile_limit,
        "daily_dm_limit": account.daily_dm_limit,
        "last_verified": account.last_verified,
        "status": account.status,
        "discovered_leads_count": len(discovered_leads)
    }


# -------------------------------
# Optional Endpoint: Get all accounts (active + inactive)
# -------------------------------
@router.get("/accounts/all", response_model=List[Dict])
def get_all_accounts():
    accounts = loader.get_all_accounts()
    return [
        {
            "internal_id": acc.internal_id,
            "profile_url": acc.profile_url,
            "daily_profile_limit": acc.daily_profile_limit,
            "daily_dm_limit": acc.daily_dm_limit,
            "last_verified": acc.last_verified,
            "status": acc.status
        }
        for acc in accounts
    ]
