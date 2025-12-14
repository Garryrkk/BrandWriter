from sqlalchemy import Column, String, Text, JSON, DateTime, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.database import Base

class HistoryStatus(str, enum.Enum):
    GENERATED = "generated"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

class History(Base):
    __tablename__ = "history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Content Identification
    category = Column(String(100), nullable=False, index=True)
    platform = Column(String(50), nullable=False)
    
    # Content
    title = Column(String(500))
    content = Column(JSON, nullable=False)
    
    # Generation Details
    raw_prompt = Column(Text)
    model_used = Column(String(100))
    variation = Column(String(50))
    rag_documents_used = Column(JSON)  # List of document IDs/references
    
    # Metadata
    metadata = Column(JSON)  # Additional context
    tone = Column(String(100))
    
    # Assets
    asset_urls = Column(JSON)
    
    # Publishing Info
    status = Column(SQLEnum(HistoryStatus), default=HistoryStatus.GENERATED)
    published_url = Column(String(1000))  # URL of published content
    engagement_metrics = Column(JSON)  # {likes, comments, shares, views}
    
    # Performance Tracking
    impression_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)
    conversion_count = Column(Integer, default=0)
    
    # Related Entities
    draft_id = Column(UUID(as_uuid=True), ForeignKey("drafts.id"))
    basket_id = Column(UUID(as_uuid=True), ForeignKey("basket.id"))
    schedule_id = Column(UUID(as_uuid=True), ForeignKey("schedules.id"))
    
    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow, index=True)
    scheduled_at = Column(DateTime)
    published_at = Column(DateTime)
    
    # Relationships
    brand = relationship("Brand", backref="history")
    
    def __repr__(self):
        return f"<History(id={self.id}, category={self.category}, status={self.status})>"