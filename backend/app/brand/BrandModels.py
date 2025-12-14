from sqlalchemy import Column, String, Text, JSON, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.database import Base

class Brand(Base):
    __tablename__ = "brands"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    
    # Brand Identity
    description = Column(Text)
    tagline = Column(String(500))
    mission = Column(Text)
    vision = Column(Text)
    values = Column(JSON)  # List of brand values
    
    # Voice & Tone
    voice_profile = Column(JSON)  # {tone, personality, style_guide}
    tone_attributes = Column(JSON)  # {formal: 3, casual: 7, professional: 8}
    language_preferences = Column(JSON)  # {primary_language, avoid_words, preferred_terms}
    
    # Visual Identity
    color_palette = Column(JSON)  # {primary, secondary, accent}
    logo_url = Column(String(500))
    fonts = Column(JSON)  # {heading, body, accent}
    
    # Target Audience
    target_audience = Column(JSON)  # {demographics, psychographics, pain_points}
    buyer_personas = Column(JSON)  # List of persona objects
    
    # Industry & Positioning
    industry = Column(String(255))
    sub_industry = Column(String(255))
    positioning_statement = Column(Text)
    unique_value_proposition = Column(Text)
    competitors = Column(JSON)  # List of competitor info
    
    # Social Media Profiles
    social_handles = Column(JSON)  # {instagram, linkedin, youtube, twitter}
    
    # Content Strategy
    content_pillars = Column(JSON)  # List of main content themes
    hashtag_sets = Column(JSON)  # Categorized hashtag groups
    posting_schedule = Column(JSON)  # Default schedule per platform
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Brand(id={self.id}, name={self.name})>"