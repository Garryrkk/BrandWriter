from sqlalchemy import Column, String, Text, JSON, DateTime, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.database import Base

class PostingStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"

class Schedule(Base):
    __tablename__ = "schedules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Platform & Category
    platform = Column(String(50), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    
    # Content Reference
    post_id = Column(UUID(as_uuid=True))  # Generic reference
    basket_id = Column(UUID(as_uuid=True), ForeignKey("basket.id"))
    draft_id = Column(UUID(as_uuid=True), ForeignKey("drafts.id"))
    
    # Content (denormalized for quick access)
    content = Column(JSON, nullable=False)
    assets = Column(JSON)
    
    # Scheduling
    scheduled_date = Column(DateTime, nullable=False, index=True)
    scheduled_time = Column(DateTime, nullable=False)
    timezone = Column(String(50), default="UTC")
    
    # Posting Configuration
    posting_options = Column(JSON)  # Platform-specific options
    # Examples:
    # Instagram: {location_id, user_tags, product_tags}
    # LinkedIn: {visibility: "public", share_commentary: true}
    # YouTube: {category, tags, privacy}
    
    # Status & Tracking
    posting_status = Column(SQLEnum(PostingStatus), default=PostingStatus.PENDING, index=True)
    attempt_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=3)
    
    # Error Handling
    error_message = Column(Text)
    error_details = Column(JSON)
    last_attempt_at = Column(DateTime)
    
    # Publishing Result
    published_url = Column(String(1000))
    platform_post_id = Column(String(255))  # ID from social platform
    
    # meta_data 
    meta_data  = Column(JSON)
    notes = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    posted_at = Column(DateTime)
    
    # Relationships
    brand = relationship("Brand", backref="schedules")
    basket_item = relationship("Basket", backref="schedule")
    
    def __repr__(self):
        return f"<Schedule(id={self.id}, platform={self.platform}, status={self.posting_status})>"