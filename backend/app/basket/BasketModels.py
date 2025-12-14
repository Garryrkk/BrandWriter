from sqlalchemy import Column, String, Text, JSON, DateTime, Enum as SQLEnum, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.database import Base

class BasketItemType(str, enum.Enum):
    POST = "post"
    REEL = "reel"
    SHORT = "short"
    CAROUSEL = "carousel"
    STORY = "story"
    EMAIL = "email"
    DM = "dm"
    IDEA = "idea"

class BasketStatus(str, enum.Enum):
    PENDING = "pending"
    READY = "ready"
    SCHEDULED = "scheduled"
    ARCHIVED = "archived"

class Basket(Base):
    __tablename__ = "basket"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Content Identification
    category = Column(String(100), nullable=False)
    platform = Column(String(50), nullable=False)
    item_type = Column(SQLEnum(BasketItemType), nullable=False)
    
    # Content
    title = Column(String(500))
    content = Column(JSON, nullable=False)
    
    # Assets
    assets = Column(JSON)  # {text, images, videos, files}
    # Structure: {
    #   text: ["caption", "description"],
    #   images: ["url1", "url2"],
    #   videos: ["url1"],
    #   files: ["document.pdf"]
    # }
    
    # User Notes
    notes = Column(Text)
    tags = Column(JSON)  # User-defined tags for organization
    
    # Scheduling Information
    scheduled_date = Column(DateTime)
    scheduled_time = Column(DateTime)
    scheduled_platform = Column(String(50))
    posting_options = Column(JSON)  # Platform-specific options
    
    # Priority
    priority = Column(Integer, default=0)  # Higher number = higher priority
    
    # Status
    status = Column(SQLEnum(BasketStatus), default=BasketStatus.PENDING)
    
    # Source Tracking
    draft_id = Column(UUID(as_uuid=True), ForeignKey("drafts.id"))
    generation_id = Column(UUID(as_uuid=True))
    
    # Timestamps
    added_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", backref="basket_items")
    
    def __repr__(self):
        return f"<Basket(id={self.id}, type={self.item_type}, status={self.status})>"