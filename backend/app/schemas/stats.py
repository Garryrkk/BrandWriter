from pydantic import BaseModel
from typing import List
from app.schemas.email import EmailOut

class DailyStatsOut(BaseModel):
    date: str
    total: int
    new: int
    repeated: int
    emails: List[EmailOut]