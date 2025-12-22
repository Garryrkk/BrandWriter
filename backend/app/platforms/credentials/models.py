from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid
from datetime import datetime


class PlatformCredential(Base):
    __tablename__ = "platform_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    platform = Column(String(50), nullable=False)  # instagram, linkedin, youtube, etc.
    encrypted_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PlatformCredential(brand_id={self.brand_id}, platform={self.platform})>"
