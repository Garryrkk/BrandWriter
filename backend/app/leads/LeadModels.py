import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from app.db.database import Base

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    brand_id = Column(String, ForeignKey("brands.id"), nullable=False)

    email = Column(String, index=True)
    linkedin_url = Column(String)
    full_name = Column(String)
    company = Column(String)
    title = Column(String)

    source = Column(String)  # apollo | hunter | upload
    verified = Column(Boolean, default=False)

    last_contacted_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
