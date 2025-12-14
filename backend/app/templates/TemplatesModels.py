from sqlalchemy import Column, String, Text, JSON, DateTime, Boolean, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.database import Base

class Template(Base):
    __tablename__ = "templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Template Identity
    title = Column(String(255), nullable=False, index=True)
    name = Column(String(255), nullable=False)  # Keep for backward compatibility
    description = Column(Text)
    category = Column(String(100), nullable=False, index=True)
    platform = Column(String(50), index=True)
    
    # Template Structure
    template_type = Column(String(50), default="prompt")  # prompt, visual, structure, hybrid
    structure = Column(JSON, nullable=False)
    # Structure examples:
    # - Prompt template: {system, user, variables: [], output_format: {}}
    # - Visual template: {layout, sections: [], style: {}}
    # - Content template: {intro, body, cta, hashtags}
    # - Hybrid: {prompt: {...}, visual: {...}}
    
    # Variables & Placeholders
    variables = Column(JSON)  # List of variable definitions
    # Example: [{
    #   name: "product_name", 
    #   type: "string", 
    #   required: true,
    #   default: "",
    #   description: "Name of the product"
    # }]
    
    # Prompt Engineering
    system_prompt = Column(Text)
    user_prompt_template = Column(Text)
    examples = Column(JSON)  # Few-shot examples
    # Example: [{input: {...}, output: "..."}]
    
    # Formatting Rules
    formatting_rules = Column(JSON)
    # Example: {
    #   max_length: 280, 
    #   include_hashtags: true, 
    #   hashtag_count: 5,
    #   tone: "professional",
    #   emojis: true
    # }
    
    # Platform-Specific Config
    platform_config = Column(JSON)
    # Example for Instagram: {
    #   aspect_ratio: "1:1", 
    #   min_duration: 3,
    #   max_duration: 60,
    #   caption_length: 2200
    # }
    
    # Content Guidelines
    content_guidelines = Column(JSON)
    # Example: {
    #   do: ["Be concise", "Use active voice"],
    #   dont: ["Use jargon", "Be overly salesy"]
    # }
    
    # Usage & Performance Tracking
    usage_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)  # Percentage (0-100)
    avg_engagement = Column(Float, default=0.0)
    last_used_at = Column(DateTime)
    
    # Quality Metrics
    avg_rating = Column(Float, default=0.0)
    total_ratings = Column(Integer, default=0)
    
    # Status & Visibility
    is_active = Column(Boolean, default=True, index=True)
    is_default = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)  # Can other brands use it?
    
    # Versioning
    version = Column(String(20), default="1.0")
    parent_template_id = Column(UUID(as_uuid=True), ForeignKey("templates.id"))
    
    # Tags for organization
    tags = Column(JSON)  # ["marketing", "sales", "product-launch"]
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    brand = relationship("Brand", backref="templates")
    parent_template = relationship("Template", remote_side=[id], backref="versions")
    
    def __repr__(self):
        return f"<Template(id={self.id}, title={self.title}, category={self.category})>"