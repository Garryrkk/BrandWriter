# app/models.py
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class InstagramAccount(Base):
    __tablename__ = "instagram_accounts"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_encrypted = Column(String, nullable=True)  # secure encryption recommended
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MediaItem(Base):
    __tablename__ = "media_items"
    id = Column(Integer, primary_key=True, index=True)
    brand_post_id = Column(String, index=True, nullable=True)  # optional mapping to BrandWriter post id
    url = Column(String, nullable=False)   # URL to image/video (S3/R2/hosted static)
    mime_type = Column(String, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    uploaded = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, default="instagram")
    account_id = Column(Integer, ForeignKey("instagram_accounts.id"))
    account = relationship("InstagramAccount")
    caption = Column(Text, nullable=True)
    type = Column(String, default="post")  # post | reel | story | carousel
    media_ids = Column(Text, nullable=True)  # comma-separated media ids
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="pending")  # pending | posted | failed | cancelled
    attempts = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PostLog(Base):
    __tablename__ = "post_logs"
    id = Column(Integer, primary_key=True, index=True)
    scheduled_post_id = Column(Integer, ForeignKey("scheduled_posts.id"))
    external_post_id = Column(String, nullable=True)  # Instagram post id
    status = Column(String)
    response = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
