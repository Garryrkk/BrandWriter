"""
Database models and connection for email outreach system
Uses SQLite with SQLAlchemy ORM
"""

from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean, Text, Enum, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
import enum

# Database connection - Use SQLite for simplicity
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///C:/Users/Crazy/Documents/CODES/BrandWriter-main/emails.db")
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums for status tracking
class EmailStatus(str, enum.Enum):
    DRAFT = "draft"
    QUEUED = "queued"
    DELETED = "deleted"


class EmailDiscoveryStatus(str, enum.Enum):
    DISCOVERED = "discovered"
    VALIDATED = "validated"
    REJECTED_ROLE = "rejected_role"
    REJECTED_DOMAIN = "rejected_domain"
    REJECTED_QUALITY = "rejected_quality"


class CampaignStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"


class ScanStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VALID = "valid"
    INVALID = "invalid"
    RISKY = "risky"


class SendStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    BOUNCED = "bounced"


class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    website = Column(String(500))
    linkedin = Column(String(500))
    company_type = Column(String(100))
    status = Column(String(50), default="active")
    last_contacted = Column(DateTime)
    last_scanned = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    people = relationship("Person", back_populates="company", cascade="all, delete-orphan")
    emails = relationship("Email", back_populates="company", cascade="all, delete-orphan")
    scans = relationship("ScanJob", back_populates="company", cascade="all, delete-orphan")


class Person(Base):
    __tablename__ = "people"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    full_name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    role = Column(String(255))
    role_confidence = Column(Float)
    source_page = Column(String(500), nullable=False)
    linkedin = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="people")
    emails = relationship("Email", back_populates="person")


class Email(Base):
    __tablename__ = "emails"
    
    id = Column(Integer, primary_key=True, index=True)
    email_address = Column(String(255), unique=True, nullable=False, index=True)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    scan_job_id = Column(Integer, ForeignKey("scan_jobs.id"), nullable=False)
    
    # Status tracking
    status = Column(String(50), default=EmailStatus.DRAFT, index=True)
    discovery_status = Column(String(50), default=EmailDiscoveryStatus.DISCOVERED, index=True)
    verification_status = Column(String(50), default=VerificationStatus.PENDING, index=True)
    
    # Source traceability (MANDATORY)
    source_type = Column(String(50), nullable=False)  # website, linkedin, pattern_guess
    source_url = Column(String(500), nullable=False)
    discovery_method = Column(String(50), nullable=False)  # regex, structured, inferred
    
    # Quality metrics
    quality_score = Column(Integer, default=0)
    confidence_score = Column(Float, default=0.0)
    confidence_level = Column(String(20))  # low, medium, high
    is_validated = Column(Boolean, default=False)
    
    # Verification details
    mx_valid = Column(Boolean, default=False)
    smtp_valid = Column(Boolean, default=False)
    is_disposable = Column(Boolean, default=False)
    is_role_email = Column(Boolean, default=False)
    verification_error = Column(Text)
    verified_at = Column(DateTime)
    
    # Send tracking
    last_sent_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="emails")
    person = relationship("Person", back_populates="emails")
    scan_job = relationship("ScanJob", back_populates="emails")
    send_logs = relationship("SendLog", back_populates="email")


class ScanJob(Base):
    __tablename__ = "scan_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    status = Column(String(50), default=ScanStatus.PENDING, index=True)
    
    # Scan configuration
    scan_website = Column(Boolean, default=True)
    scan_linkedin = Column(Boolean, default=False)
    max_pages = Column(Integer, default=5)
    
    # Results
    people_found = Column(Integer, default=0)
    emails_discovered = Column(Integer, default=0)
    emails_validated = Column(Integer, default=0)
    emails_rejected_role = Column(Integer, default=0)
    emails_rejected_domain = Column(Integer, default=0)
    emails_rejected_quality = Column(Integer, default=0)
    
    # Progress tracking
    progress_percentage = Column(Integer, default=0)
    current_step = Column(String(255))
    error_message = Column(Text)
    
    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="scans")
    emails = relationship("Email", back_populates="scan_job")


class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(Text, nullable=False)
    from_email = Column(String(255), nullable=False)
    from_name = Column(String(255))
    
    # Campaign settings
    daily_limit = Column(Integer, default=100)
    status = Column(String(50), default=CampaignStatus.DRAFT, index=True)
    
    # Statistics
    total_queued = Column(Integer, default=0)
    total_sent = Column(Integer, default=0)
    total_failed = Column(Integer, default=0)
    total_bounced = Column(Integer, default=0)
    
    # Scheduling
    last_run_at = Column(DateTime)
    next_run_at = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    send_logs = relationship("SendLog", back_populates="campaign")
    send_batches = relationship("SendBatch", back_populates="campaign")


class SendBatch(Base):
    __tablename__ = "send_batches"
    
    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    
    # Batch details
    status = Column(String(50), default="pending")
    total_emails = Column(Integer, default=0)
    sent_count = Column(Integer, default=0)
    failed_count = Column(Integer, default=0)
    
    # Progress
    progress_percentage = Column(Integer, default=0)
    current_email_index = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    campaign = relationship("Campaign", back_populates="send_batches")
    send_logs = relationship("SendLog", back_populates="batch")


class SendLog(Base):
    __tablename__ = "send_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("emails.id"), nullable=False)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("send_batches.id"))
    
    # Send details
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default=SendStatus.PENDING, nullable=False, index=True)
    error_message = Column(Text)
    
    # Email metadata
    subject_sent = Column(String(500))
    body_preview = Column(Text)
    
    # Relationships
    email = relationship("Email", back_populates="send_logs")
    campaign = relationship("Campaign", back_populates="send_logs")
    batch = relationship("SendBatch", back_populates="send_logs")


class DomainCooldown(Base):
    __tablename__ = "domain_cooldowns"
    
    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String(255), unique=True, nullable=False, index=True)
    last_contacted = Column(DateTime, nullable=False)
    cooldown_days = Column(Integer, default=7)
    contact_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class EmailVerificationJob(Base):
    __tablename__ = "email_verification_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    status = Column(String(50), default="pending", index=True)
    
    # Job configuration
    email_ids = Column(Text)
    total_emails = Column(Integer, default=0)
    verified_count = Column(Integer, default=0)
    
    # Progress
    progress_percentage = Column(Integer, default=0)
    current_email_index = Column(Integer, default=0)
    
    # Results
    valid_count = Column(Integer, default=0)
    invalid_count = Column(Integer, default=0)
    risky_count = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()