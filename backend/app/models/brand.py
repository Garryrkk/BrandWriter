from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, DateTime
from datetime import datetime
from app.db.database import Base
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Brand(Base):
    __tablename__ = "brands"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    tone_examples = Column(Text)
    vocab = Column(Text)
    style_guidelines = Column(Text)
    audience = Column(Text)
    guardrails = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
