from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum
from app.db.database import Base


class ContentCategory(str, enum.Enum):
    NEWSLETTER = "newsletter"
    REEL = "reel"
    CAROUSEL = "carousel"
    POST = "post"
    STORY = "story"
    COLD_EMAIL = "cold_email"
    BLOG = "blog"
    THREAD = "thread"
    SHORT = "short"
    LINKEDIN_POST = "linkedin_post"
    ARTICLE = "article"


class Platform(str, enum.Enum):
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    EMAIL = "email"
    TIKTOK = "tiktok"
    BLOG = "blog"


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(SQLEnum(ContentCategory), nullable=False, index=True)
    platform = Column(SQLEnum(Platform), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    structure = Column(JSON, nullable=False)  # JSON with sections
    prompt = Column(Text, nullable=False)  # LLM template with placeholders
    recommended_length = Column(Integer, nullable=True)
    tone = Column(String(100), nullable=True)  # Default tone
    active = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Template {self.name} - {self.category.value} - {self.platform.value}>"
