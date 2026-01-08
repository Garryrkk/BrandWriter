from pydantic import BaseModel, EmailStr
from typing import Optional

class LeadCreate(BaseModel):
    email: Optional[EmailStr]
    linkedin_url: Optional[str]
    full_name: Optional[str]
    company: Optional[str]
    title: Optional[str]
    source: str

class LeadResponse(BaseModel):
    id: str
    email: Optional[str]
    linkedin_url: Optional[str]
    full_name: Optional[str]
    company: Optional[str]
    title: Optional[str]
    verified: bool
    source: str

    class Config:
        orm_mode = True
