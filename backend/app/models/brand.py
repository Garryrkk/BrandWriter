from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, DateTime
from datetime import datetime
from app.db.database import Base


class Brand(Base):
    __tablename__ = "brands"


id = Column(Integer, primary_key=True, index=True)
user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
name = Column(String, nullable=False)
tone_examples = Column(Text)
vocab = Column(Text)
style_guidelines = Column(Text)
audience = Column(Text)
guardrails = Column(JSON, nullable=True)
created_at = Column(DateTime, default=datetime.utcnow)