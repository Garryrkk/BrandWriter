from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, DateTime
from datetime import datetime
from app.db.database import Base


class Generation(Base):
    __tablename__ = "generations"


id = Column(Integer, primary_key=True, index=True)
brand_id = Column(Integer, ForeignKey("brands.id", ondelete="SET NULL"))
template_id = Column(Integer, ForeignKey("templates.id", ondelete="SET NULL"))
tone = Column(String)
prompt = Column(Text)
outputs = Column(JSON)
metadata = Column(JSON)
created_at = Column(DateTime, default=datetime.utcnow)