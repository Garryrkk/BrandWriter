# app/routes/auth.py
from fastapi import APIRouter, HTTPException, Header, Depends
from app.db import get_db
from sqlalchemy.orm import Session
from app.models import InstagramAccount
from app.schemas import ScheduleOut
from pydantic import BaseModel
import os

router = APIRouter()

API_KEY = os.getenv("INSTA_SERVICE_API_KEY")

def check_api_key(x_api_key: str = Header(None)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

class AccountCreate(BaseModel):
    username: str
    password: str

@router.post("/create_account")
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    acc = InstagramAccount(username=payload.username, password_encrypted=payload.password)
    db.add(acc); db.commit(); db.refresh(acc)
    return {"id": acc.id, "username": acc.username}
