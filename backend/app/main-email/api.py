"""
FastAPI REST API for email outreach system
Complete API with scan management, verification, and campaign sending
Frontend only sees: discovered + validated emails
"""

from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
import json

from database import (
    get_db, init_db, Company, Person, Email, Campaign, SendLog,
    ScanJob, SendBatch, EmailVerificationJob,
    EmailStatus, EmailDiscoveryStatus, CampaignStatus, ScanStatus, VerificationStatus, SendStatus
)
from scraper import start_scan, get_scan_status
from email_validator import validate_email_full, is_allowed_role, batch_validate_emails
from email_sender import (
    start_campaign, send_campaign_now, get_send_batch_status,
    finalize_campaign_run, CampaignManager
)

# Initialize FastAPI app
app = FastAPI(
    title="Email Outreach API",
    description="Precision email outreach for decision-makers with scan and campaign management",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Models
# ============================================================================

class CompanyCreate(BaseModel):
    name: str
    domain: str
    website: Optional[str] = None
    linkedin: Optional[str] = None
    company_type: Optional[str] = None


# ✅ FIX 1: Add ScanRequest model for JSON body
class ScanRequest(BaseModel):
    scan_website: bool = True
    scan_linkedin: bool = False
    max_pages: int = 5
    verify_emails: bool = True


class ScanJobCreate(BaseModel):
    company_id: int
    scan_website: bool = True
    scan_linkedin: bool = False
    max_pages: int = 5
    verify_emails: bool = True


class EmailQueueRequest(BaseModel):
    email_ids: List[int]


class EmailBulkVerifyRequest(BaseModel):
    email_ids: List[int]
    check_mx: bool = True
    check_smtp: bool = False


class CampaignCreate(BaseModel):
    name: str
    subject: str
    body: str
    from_email: EmailStr
    from_name: Optional[str] = None
    daily_limit: int = 100


class CampaignSendRequest(BaseModel):
    campaign_id: int
    daily_limit: Optional[int] = 100


# Response models
class PersonResponse(BaseModel):
    id: int
    full_name: str
    role: Optional[str]
    role_confidence: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


class EmailResponse(BaseModel):
    id: int
    email_address: str
    person: Optional[PersonResponse]
    status: str
    verification_status: str
    quality_score: int
    confidence_score: float
    confidence_level: str
    source_type: str
    discovery_method: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class CampaignResponse(BaseModel):
    id: int
    name: str
    subject: str
    status: str
    total_sent: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()


# ============================================================================
# Health Check
# ============================================================================

@app.get("/health")
async def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "2.0.0"
    }


# ============================================================================
# Company Endpoints
# ============================================================================

@app.post("/companies/")
async def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    """Create a new company"""
    existing = db.query(Company).filter(Company.domain == company.domain).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company already exists")
    
    db_company = Company(**company.dict())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    
    return {
        "id": db_company.id,
        "name": db_company.name,
        "domain": db_company.domain,
        "status": "created"
    }


# ✅ FIX 4: Add endpoint to check if company exists by domain
@app.get("/companies/by-domain/{domain}")
async def get_company_by_domain(domain: str, db: Session = Depends(get_db)):
    """Get company by domain (returns null if not found)"""
    company = db.query(Company).filter(Company.domain == domain).first()
    if not company:
        return None
    
    # Only count validated emails
    validated_emails = db.query(Email).filter(
        Email.company_id == company.id,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    return {
        "id": company.id,
        "name": company.name,
        "domain": company.domain,
        "website": company.website,
        "linkedin": company.linkedin,
        "status": company.status,
        "email_count": validated_emails
    }


@app.get("/companies/")
async def list_companies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all companies"""
    companies = db.query(Company).offset(skip).limit(limit).all()
    
    result = []
    for c in companies:
        # Only count validated emails
        validated_emails = db.query(Email).filter(
            Email.company_id == c.id,
            Email.discovery_status == EmailDiscoveryStatus.VALIDATED
        ).count()
        
        result.append({
            "id": c.id,
            "name": c.name,
            "domain": c.domain,
            "status": c.status,
            "last_scanned": c.last_scanned,
            "people_count": len(c.people),
            "email_count": validated_emails
        })
    
    return result


@app.get("/companies/{company_id}")
async def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company details"""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Only count validated emails
    validated_emails = db.query(Email).filter(
        Email.company_id == company_id,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    return {
        "id": company.id,
        "name": company.name,
        "domain": company.domain,
        "website": company.website,
        "linkedin": company.linkedin,
        "status": company.status,
        "last_scanned": company.last_scanned,
        "people_count": len(company.people),
        "email_count": validated_emails,
        "created_at": company.created_at
    }


# ============================================================================
# Scan Job Endpoints (PRIMARY USER FLOW)
# ============================================================================

# ✅ FIX 2 & 3: Accept JSON body and return scan_job_id
@app.post("/companies/{company_id}/scan")
async def scan_company(
    company_id: int,
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    PRIMARY ENDPOINT: Scan company to discover people and emails
    This triggers the full pipeline: Company → People → Roles → Emails → Drafts
    Accepts JSON body instead of query parameters
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Create scan job first to get ID
    scan_job = ScanJob(
        company_id=company_id,
        status=ScanStatus.PENDING,
        progress_percentage=0
    )
    db.add(scan_job)
    db.commit()
    db.refresh(scan_job)
    
    # Run scan in background, passing the scan_job_id
    background_tasks.add_task(
        start_scan,
        db,
        company_id,
        scan_request.scan_website,
        scan_request.scan_linkedin,
        scan_request.max_pages,
        scan_request.verify_emails,
        scan_job.id  # Pass scan job ID to track progress
    )
    
    return {
        "status": "started",
        "scan_job_id": scan_job.id,
        "company_id": company_id,
        "company_name": company.name,
        "message": "System will discover people, filter decision-makers, and create email drafts"
    }


@app.get("/scans/{scan_job_id}/status")
async def get_scan_job_status(scan_job_id: int, db: Session = Depends(get_db)):
    """Get scan job status and progress"""
    status = get_scan_status(db, scan_job_id)
    if not status:
        raise HTTPException(status_code=404, detail="Scan job not found")
    
    return status


@app.get("/scans/company/{company_id}")
async def get_company_scans(
    company_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get all scan jobs for a company"""
    scans = db.query(ScanJob).filter(
        ScanJob.company_id == company_id
    ).order_by(ScanJob.created_at.desc()).limit(limit).all()
    
    return [{
        "id": scan.id,
        "status": scan.status,
        "progress_percentage": scan.progress_percentage,
        "people_found": scan.people_found,
        "emails_discovered": scan.emails_discovered,
        "emails_validated": scan.emails_validated,
        "emails_rejected_domain": scan.emails_rejected_domain,
        "emails_rejected_quality": scan.emails_rejected_quality,
        "started_at": scan.started_at,
        "completed_at": scan.completed_at
    } for scan in scans]


# ============================================================================
# People Endpoints
# ============================================================================

@app.get("/people/")
async def list_people(
    company_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List discovered people (decision makers only)"""
    query = db.query(Person)
    
    if company_id:
        query = query.filter(Person.company_id == company_id)
    
    people = query.offset(skip).limit(limit).all()
    
    result = []
    for p in people:
        # Only count validated emails
        validated_emails = db.query(Email).filter(
            Email.person_id == p.id,
            Email.discovery_status == EmailDiscoveryStatus.VALIDATED
        ).count()
        
        result.append({
            "id": p.id,
            "full_name": p.full_name,
            "role": p.role,
            "role_confidence": p.role_confidence,
            "company": p.company.name if p.company else None,
            "email_count": validated_emails,
            "created_at": p.created_at
        })
    
    return result


@app.get("/people/{person_id}")
async def get_person(person_id: int, db: Session = Depends(get_db)):
    """Get person details"""
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Only return validated emails
    validated_emails = db.query(Email).filter(
        Email.person_id == person_id,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).all()
    
    return {
        "id": person.id,
        "full_name": person.full_name,
        "role": person.role,
        "role_confidence": person.role_confidence,
        "source_page": person.source_page,
        "company": {
            "id": person.company.id,
            "name": person.company.name
        } if person.company else None,
        "emails": [{
            "id": e.id,
            "email_address": e.email_address,
            "status": e.status,
            "quality_score": e.quality_score,
            "confidence_score": e.confidence_score,
            "confidence_level": e.confidence_level,
            "source_type": e.source_type,
            "discovery_method": e.discovery_method
        } for e in validated_emails],
        "created_at": person.created_at
    }


# ============================================================================
# Email Endpoints (ONLY VALIDATED EMAILS)
# ============================================================================

@app.get("/emails/")
async def list_emails(
    status: Optional[str] = None,
    company_id: Optional[int] = None,
    person_id: Optional[int] = None,
    min_confidence: Optional[float] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    List emails with filters
    ONLY RETURNS VALIDATED EMAILS (frontend never sees rejected)
    """
    query = db.query(Email).filter(
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    )
    
    if status:
        query = query.filter(Email.status == status)
    
    if company_id:
        query = query.filter(Email.company_id == company_id)
    
    if person_id:
        query = query.filter(Email.person_id == person_id)
    
    if min_confidence:
        query = query.filter(Email.confidence_score >= min_confidence)
    
    emails = query.offset(skip).limit(limit).all()
    
    return [{
        "id": e.id,
        "email_address": e.email_address,
        "person": {
            "id": e.person.id,
            "full_name": e.person.full_name,
            "role": e.person.role,
            "role_confidence": e.person.role_confidence
        } if e.person else None,
        "status": e.status,
        "verification_status": e.verification_status,
        "quality_score": e.quality_score,
        "confidence_score": e.confidence_score,
        "confidence_level": e.confidence_level,
        "source_type": e.source_type,
        "source_url": e.source_url,
        "discovery_method": e.discovery_method,
        "company": e.company.name if e.company else None
    } for e in emails]


@app.post("/emails/queue")
async def queue_emails(request: EmailQueueRequest, db: Session = Depends(get_db)):
    """Queue emails for sending (only validated emails)"""
    queued_count = 0
    already_queued = 0
    
    for email_id in request.email_ids:
        email = db.query(Email).filter(
            Email.id == email_id,
            Email.discovery_status == EmailDiscoveryStatus.VALIDATED
        ).first()
        
        if email:
            if email.status == EmailStatus.DRAFT:
                email.status = EmailStatus.QUEUED
                queued_count += 1
            elif email.status == EmailStatus.QUEUED:
                already_queued += 1
    
    db.commit()
    
    return {
        "queued": queued_count,
        "already_queued": already_queued,
        "total": len(request.email_ids)
    }


@app.post("/emails/verify/{email_id}")
async def verify_single_email(
    email_id: int,
    check_smtp: bool = False,
    db: Session = Depends(get_db)
):
    """Verify a specific email"""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).first()
    
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    
    # Get company domain
    company = db.query(Company).filter(Company.id == email.company_id).first()
    
    validation = validate_email_full(
        email.email_address,
        company.domain,
        role_confidence=email.person.role_confidence if email.person else 1.0,
        discovery_method=email.discovery_method,
        check_mx=True,
        check_smtp=check_smtp
    )
    
    # Update email record
    email.quality_score = validation['quality_score']
    email.confidence_score = validation['confidence_score']
    email.confidence_level = validation['confidence_level']
    email.is_validated = True
    email.mx_valid = validation['mx_valid']
    email.smtp_valid = validation.get('smtp_valid', False)
    email.is_disposable = validation['is_disposable']
    email.is_role_email = validation['is_role_email']
    email.verification_status = validation['verification_status']
    email.verified_at = datetime.utcnow()
    
    if not validation['is_valid']:
        email.status = EmailStatus.DELETED
        email.discovery_status = EmailDiscoveryStatus.REJECTED_QUALITY
        email.verification_error = validation['reason']
    
    db.commit()
    
    return {
        "email": email.email_address,
        "is_valid": validation['is_valid'],
        "verification_status": validation['verification_status'],
        "quality_score": validation['quality_score'],
        "confidence_score": validation['confidence_score'],
        "confidence_level": validation['confidence_level'],
        "reason": validation['reason']
    }


@app.post("/emails/verify/bulk")
async def verify_bulk_emails(
    request: EmailBulkVerifyRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Verify multiple emails in bulk (only validated emails)"""
    emails_to_verify = db.query(Email).filter(
        Email.id.in_(request.email_ids),
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).all()
    
    if not emails_to_verify:
        raise HTTPException(status_code=404, detail="No emails found")
    
    # Create verification job
    job = EmailVerificationJob(
        email_ids=json.dumps(request.email_ids),
        total_emails=len(request.email_ids),
        status='pending'
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    # Run verification in background
    def verify_emails_task():
        job.status = 'running'
        job.started_at = datetime.utcnow()
        db.commit()
        
        for idx, email in enumerate(emails_to_verify):
            company = db.query(Company).filter(Company.id == email.company_id).first()
            
            validation = validate_email_full(
                email.email_address,
                company.domain,
                role_confidence=email.person.role_confidence if email.person else 1.0,
                discovery_method=email.discovery_method,
                check_mx=request.check_mx,
                check_smtp=request.check_smtp
            )
            
            email.quality_score = validation['quality_score']
            email.confidence_score = validation['confidence_score']
            email.confidence_level = validation['confidence_level']
            email.is_validated = True
            email.mx_valid = validation['mx_valid']
            email.is_disposable = validation['is_disposable']
            email.is_role_email = validation['is_role_email']
            email.verification_status = validation['verification_status']
            email.verified_at = datetime.utcnow()
            
            if not validation['is_valid']:
                email.status = EmailStatus.DELETED
                email.discovery_status = EmailDiscoveryStatus.REJECTED_QUALITY
                job.invalid_count += 1
            elif validation['verification_status'] == VerificationStatus.VALID:
                job.valid_count += 1
            else:
                job.risky_count += 1
            
            job.verified_count += 1
            job.current_email_index = idx
            job.progress_percentage = int((idx / len(emails_to_verify)) * 100)
            db.commit()
        
        job.status = 'completed'
        job.completed_at = datetime.utcnow()
        job.progress_percentage = 100
        db.commit()
    
    background_tasks.add_task(verify_emails_task)
    
    return {
        "message": "Bulk verification started",
        "job_id": job.id,
        "total_emails": len(request.email_ids)
    }


@app.get("/emails/verify/job/{job_id}")
async def get_verification_job_status(job_id: int, db: Session = Depends(get_db)):
    """Get verification job status"""
    job = db.query(EmailVerificationJob).filter(
        EmailVerificationJob.id == job_id
    ).first()
    
    if not job:
        raise HTTPException(status_code=404, detail="Verification job not found")
    
    return {
        "id": job.id,
        "status": job.status,
        "progress_percentage": job.progress_percentage,
        "total_emails": job.total_emails,
        "verified_count": job.verified_count,
        "valid_count": job.valid_count,
        "invalid_count": job.invalid_count,
        "risky_count": job.risky_count,
        "started_at": job.started_at,
        "completed_at": job.completed_at
    }


# ============================================================================
# Campaign Endpoints
# ============================================================================

@app.post("/campaigns/")
async def create_campaign(
    campaign: CampaignCreate,
    db: Session = Depends(get_db)
):
    """Create a new email campaign"""
    manager = CampaignManager(db)
    db_campaign = manager.create_campaign(
        name=campaign.name,
        subject=campaign.subject,
        body=campaign.body,
        from_email=campaign.from_email,
        from_name=campaign.from_name,
        daily_limit=campaign.daily_limit
    )
    
    return {
        "id": db_campaign.id,
        "name": db_campaign.name,
        "status": db_campaign.status
    }


@app.get("/campaigns/")
async def list_campaigns(db: Session = Depends(get_db)):
    """List all campaigns"""
    campaigns = db.query(Campaign).all()
    return [{
        "id": c.id,
        "name": c.name,
        "status": c.status,
        "total_sent": c.total_sent,
        "total_failed": c.total_failed,
        "created_at": c.created_at
    } for c in campaigns]


@app.get("/campaigns/{campaign_id}")
async def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Get campaign details"""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return {
        "id": campaign.id,
        "name": campaign.name,
        "subject": campaign.subject,
        "body": campaign.body,
        "from_email": campaign.from_email,
        "from_name": campaign.from_name,
        "status": campaign.status,
        "daily_limit": campaign.daily_limit,
        "total_sent": campaign.total_sent,
        "total_failed": campaign.total_failed,
        "total_bounced": campaign.total_bounced,
        "last_run_at": campaign.last_run_at,
        "created_at": campaign.created_at
    }


@app.post("/campaigns/{campaign_id}/start")
async def start_campaign_endpoint(campaign_id: int, db: Session = Depends(get_db)):
    """Start a campaign (activate it)"""
    success = start_campaign(db, campaign_id)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Cannot start campaign. Check campaign status."
        )
    
    return {"message": "Campaign started", "campaign_id": campaign_id}


@app.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Pause a campaign"""
    manager = CampaignManager(db)
    success = manager.pause_campaign(campaign_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot pause campaign")
    
    return {"message": "Campaign paused", "campaign_id": campaign_id}


@app.post("/campaigns/{campaign_id}/resume")
async def resume_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Resume a paused campaign"""
    manager = CampaignManager(db)
    success = manager.resume_campaign(campaign_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Cannot resume campaign")
    
    return {"message": "Campaign resumed", "campaign_id": campaign_id}


@app.post("/campaigns/send")
async def send_campaign(
    request: CampaignSendRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Send campaign batch immediately"""
    campaign = db.query(Campaign).filter(
        Campaign.id == request.campaign_id
    ).first()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if campaign.status != CampaignStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Campaign is not active")
    
    # Send in background
    background_tasks.add_task(
        send_campaign_now,
        db,
        request.campaign_id,
        request.daily_limit
    )
    
    return {
        "message": "Campaign send started",
        "campaign_id": request.campaign_id
    }


@app.get("/campaigns/{campaign_id}/stats")
async def get_campaign_stats(campaign_id: int, db: Session = Depends(get_db)):
    """Get campaign statistics"""
    manager = CampaignManager(db)
    stats = manager.get_campaign_stats(campaign_id)
    
    if not stats:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    # Add queue stats (only validated emails)
    queued = db.query(Email).filter(
        Email.status == EmailStatus.QUEUED,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    draft = db.query(Email).filter(
        Email.status == EmailStatus.DRAFT,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    stats['emails_queued'] = queued
    stats['emails_draft'] = draft
    
    return stats


@app.get("/campaigns/{campaign_id}/batches")
async def get_campaign_batches(
    campaign_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get send batches for a campaign"""
    batches = db.query(SendBatch).filter(
        SendBatch.campaign_id == campaign_id
    ).order_by(SendBatch.created_at.desc()).limit(limit).all()
    
    return [{
        "id": batch.id,
        "status": batch.status,
        "total_emails": batch.total_emails,
        "sent_count": batch.sent_count,
        "failed_count": batch.failed_count,
        "progress_percentage": batch.progress_percentage,
        "started_at": batch.started_at,
        "completed_at": batch.completed_at
    } for batch in batches]


@app.get("/batches/{batch_id}/status")
async def get_batch_status(batch_id: int, db: Session = Depends(get_db)):
    """Get send batch status"""
    status = get_send_batch_status(db, batch_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return status


# ============================================================================
# Statistics Endpoints
# ============================================================================

@app.get("/stats/overview")
async def get_overview_stats(db: Session = Depends(get_db)):
    """Get overall system statistics (only validated emails)"""
    total_companies = db.query(Company).count()
    total_people = db.query(Person).count()
    
    # Only count validated emails
    total_emails = db.query(Email).filter(
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    draft_emails = db.query(Email).filter(
        Email.status == EmailStatus.DRAFT,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    queued_emails = db.query(Email).filter(
        Email.status == EmailStatus.QUEUED,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    valid_emails = db.query(Email).filter(
        Email.verification_status == VerificationStatus.VALID,
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    # High confidence emails
    high_confidence = db.query(Email).filter(
        Email.confidence_level == 'high',
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).count()
    
    total_campaigns = db.query(Campaign).count()
    active_campaigns = db.query(Campaign).filter(
        Campaign.status == CampaignStatus.ACTIVE
    ).count()
    
    total_sent = db.query(SendLog).filter(
        SendLog.status == SendStatus.SENT
    ).count()
    
    return {
        "companies": total_companies,
        "people": {
            "total": total_people,
            "decision_makers": total_people
        },
        "emails": {
            "total": total_emails,
            "draft": draft_emails,
            "queued": queued_emails,
            "valid": valid_emails,
            "high_confidence": high_confidence
        },
        "campaigns": {
            "total": total_campaigns,
            "active": active_campaigns
        },
        "total_sent": total_sent
    }


# ============================================================================
# Utility Endpoints
# ============================================================================

@app.post("/utils/reset-queue")
async def reset_email_queue(db: Session = Depends(get_db)):
    """Reset all queued emails to draft"""
    reset_count = finalize_campaign_run(db)
    
    return {
        "message": "Queue reset complete",
        "emails_reset": reset_count
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)