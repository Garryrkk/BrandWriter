from sqlalchemy import Column, String, Text, JSON, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.db.database import Base

class ContentCategory(str, enum.Enum):
    NEWSLETTER = "newsletter"
    LINKEDIN_POST = "linkedin_post"
    YOUTUBE_SHORT = "youtube_short"
    INSTAGRAM_REEL = "instagram_reel"
    INSTAGRAM_POST = "instagram_post"
    INSTAGRAM_CAROUSEL = "instagram_carousel"
    INSTAGRAM_STORY = "instagram_story"
    COLD_EMAIL = "cold_email"
    COLD_DM = "cold_dm"
    BRAND_IDEA = "brand_idea"
    LEAD_GENERATION = "lead_generation"

class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    EMAIL = "email"
    DM = "dm"
    INTERNAL = "internal"

class DraftStatus(str, enum.Enum):
    DRAFT = "draft"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"

class Draft(Base):
    __tablename__ = "drafts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Content Identification
    category = Column(SQLEnum(ContentCategory), nullable=False, index=True)
    platform = Column(SQLEnum(Platform), nullable=False)
    
    # Content
    title = Column(String(500))
    content = Column(JSON, nullable=False)  # Flexible structure per content type
    # Structure examples:
    # - Text post: {text, hashtags, cta}
    # - Carousel: {slides: [{image, caption}], overall_caption}
    # - Video: {script, description, thumbnail_idea}
    
    # Metadata
    meta_data = Column(JSON)  # {tone, prompt_used, variation_id, model_used, rag_docs}
    tone = Column(String(100))
    
    # Generation Info
    prompt_used = Column(Text)
    variation_id = Column(String(50))
    model_used = Column(String(100))
    rag_documents_used = Column(JSON)  # List of document IDs
    
    # Assets
    asset_urls = Column(JSON)  # {images: [], videos: [], files: []}
    
    # Status
    status = Column(SQLEnum(DraftStatus), default=DraftStatus.DRAFT)
    
    # User Notes
    notes = Column(Text)
    
    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", backref="drafts")
    
    def __repr__(self):
        return f"<Draft(id={self.id}, category={self.category}, status={self.status})>"