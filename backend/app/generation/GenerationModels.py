from sqlalchemy import Column, String, Text, JSON, DateTime, Float, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.db.database import Base

class Generation(Base):
    __tablename__ = "generations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False)
    
    # Generation Request
    category = Column(String(100), nullable=False, index=True)
    platform = Column(String(50))
    prompt = Column(Text, nullable=False)
    
    # AI Configuration
    model_used = Column(String(100))
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer)
    
    # RAG Context
    rag_enabled = Column(Boolean, default=False)
    rag_documents_used = Column(JSON)  # List of document references
    rag_query = Column(Text)
    rag_context = Column(Text)  # Retrieved context
    
    # Output
    output = Column(JSON, nullable=False)  # Generated content
    variations = Column(JSON)  # List of variations if generated
    selected_variation = Column(Integer)  # Index of selected variation
    
    # meta_data
    meta_data = Column(JSON)
    tone = Column(String(100))
    style_attributes = Column(JSON)
    
    # Quality Metrics
    quality_score = Column(Float)  # Internal quality assessment
    token_count = Column(Integer)
    generation_time = Column(Float)  # seconds
    
    # User Feedback
    user_rating = Column(Integer)  # 1-5 rating
    user_feedback = Column(Text)
    was_used = Column(Boolean, default=False)  # Was this actually used/published
    
    # Batch Information (for daily auto-generation)
    batch_id = Column(UUID(as_uuid=True))
    is_auto_generated = Column(Boolean, default=False)
    
    # Related Entities
    draft_id = Column(UUID(as_uuid=True), ForeignKey("drafts.id"))
    basket_id = Column(UUID(as_uuid=True), ForeignKey("basket.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    brand = relationship("Brand", backref="generations")
    
    def __repr__(self):
        return f"<Generation(id={self.id}, category={self.category}, model={self.model_used})>"