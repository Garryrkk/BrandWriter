"""
FastAPI REST API for email outreach system
Complete API with scan management, verification, and campaign sending
Frontend only sees: discovered + validated emails
FULLY INTEGRATED: All classes and functions from scraper, validator, sender, database
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
    ScanJob, SendBatch, EmailVerificationJob, DomainCooldown,
    EmailStatus, EmailDiscoveryStatus, CampaignStatus, ScanStatus, VerificationStatus, SendStatus
)
from scraper import start_scan, get_scan_status, PeopleDiscovery, EmailDiscovery, EmailScraper, ScanJobManager
from email_validator import (
    validate_email_full, is_allowed_role, batch_validate_emails, is_blocked_prefix,
    is_company_domain_match, is_blocked_domain, is_disposable_email, is_human_like, 
    check_mx_record, verify_smtp, calculate_confidence_score, normalize_role,
    validate_email_format, DECISION_MAKER_ROLES, BLOCKED_PREFIXES, BLOCKED_DOMAINS,
    DISPOSABLE_DOMAINS, HUMAN_EMAIL_PATTERNS
)
from email_sender import (
    CampaignManager, EmailSender, EmailCampaignSender
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


class EmailValidationRequest(BaseModel):
    email: str
    company_domain: str
    role_confidence: float = 1.0
    discovery_method: str = "regex"
    page_credibility: float = 1.0
    check_mx: bool = True
    check_smtp: bool = False


class BatchEmailValidationRequest(BaseModel):
    emails: List[dict]  # [{email, role_confidence, discovery_method, page_credibility}]
    company_domain: str
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


class DomainCheckRequest(BaseModel):
    domain: str


class EmailCheckRequest(BaseModel):
    email: str


class RoleCheckRequest(BaseModel):
    role: str


class WebsiteScrapeRequest(BaseModel):
    url: str
    company_id: int
    max_pages: int = 5


class FullScanRequest(BaseModel):
    company_id: int
    scan_website: bool = True
    scan_linkedin: bool = False
    max_pages: int = 5
    verify_emails: bool = True


class PeopleExtractionRequest(BaseModel):
    html: str
    page_url: str
    company_domain: str


class EmailDiscoveryRequest(BaseModel):
    person_name: str
    person_role: str
    person_source_page: str
    company_domain: str
    html: Optional[str] = None


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


@app.get("/companies/by-domain/{domain}")
async def get_company_by_domain(domain: str, db: Session = Depends(get_db)):
    """Get company by domain (returns null if not found)"""
    company = db.query(Company).filter(Company.domain == domain).first()
    if not company:
        return None
    
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
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    scan_job = ScanJob(
        company_id=company_id,
        status=ScanStatus.PENDING,
        progress_percentage=0
    )
    db.add(scan_job)
    db.commit()
    db.refresh(scan_job)
    
    background_tasks.add_task(
        start_scan,
        db,
        company_id,
        scan_request.scan_website,
        scan_request.scan_linkedin,
        scan_request.max_pages,
        scan_request.verify_emails,
        scan_job.id
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
# NEW: Direct Scraper Class Access Endpoints
# ============================================================================

@app.post("/scraper/extract-people")
async def extract_people_from_html(request: PeopleExtractionRequest):
    """
    Direct access to PeopleDiscovery.extract_people()
    Extract people with roles from HTML content
    """
    people_discovery = PeopleDiscovery()
    people = people_discovery.extract_people(
        request.html,
        request.page_url,
        request.company_domain
    )
    
    return {
        "people_found": len(people),
        "people": people
    }


@app.post("/scraper/discover-email")
async def discover_email_for_person(
    request: EmailDiscoveryRequest,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailDiscovery.discover_email()
    Discover emails for a specific person
    """
    # Create temporary person object for discovery
    person = Person(
        full_name=request.person_name,
        role=request.person_role,
        source_page=request.person_source_page,
        company_id=0  # Temporary
    )
    
    email_discovery = EmailDiscovery()
    discovered_emails = email_discovery.discover_email(
        person,
        request.company_domain,
        html=request.html
    )
    
    return {
        "emails_discovered": len(discovered_emails),
        "emails": discovered_emails
    }


@app.post("/scraper/scrape-website")
async def scrape_website_endpoint(
    request: WebsiteScrapeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailScraper.scrape_website()
    Scrape people from a website URL
    """
    # Create a scan job for tracking
    scan_job = ScanJob(
        company_id=request.company_id,
        status=ScanStatus.PENDING,
        progress_percentage=0
    )
    db.add(scan_job)
    db.commit()
    db.refresh(scan_job)
    
    def scrape_task():
        scraper = EmailScraper(db)
        people = scraper.scrape_website(
            url=request.url,
            company_id=request.company_id,
            scan_job_id=scan_job.id,
            max_pages=request.max_pages
        )
        return people
    
    background_tasks.add_task(scrape_task)
    
    return {
        "message": "Website scraping started",
        "scan_job_id": scan_job.id,
        "url": request.url
    }


@app.post("/scraper/run-full-scan")
async def run_full_scan_endpoint(
    request: FullScanRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailScraper.run_full_scan()
    Run complete scan pipeline with all options
    """
    scraper = EmailScraper(db)
    
    def scan_task():
        result = scraper.run_full_scan(
            company_id=request.company_id,
            scan_website=request.scan_website,
            scan_linkedin=request.scan_linkedin,
            max_pages=request.max_pages,
            verify_emails=request.verify_emails
        )
        return result
    
    background_tasks.add_task(scan_task)
    
    return {
        "message": "Full scan started",
        "company_id": request.company_id
    }


@app.post("/scraper/create-scan-job")
async def create_scan_job_manual(
    job: ScanJobCreate,
    db: Session = Depends(get_db)
):
    """
    Direct access to ScanJobManager.create_scan_job()
    Manually create a scan job without starting it
    """
    manager = ScanJobManager(db)
    scan_job = manager.create_scan_job(
        company_id=job.company_id,
        scan_website=job.scan_website,
        scan_linkedin=job.scan_linkedin,
        max_pages=job.max_pages
    )
    
    return {
        "scan_job_id": scan_job.id,
        "status": scan_job.status,
        "company_id": scan_job.company_id
    }


@app.post("/scraper/start-scan-job/{scan_job_id}")
async def start_scan_job_endpoint(
    scan_job_id: int,
    db: Session = Depends(get_db)
):
    """
    Direct access to ScanJobManager.start_scan_job()
    Mark scan job as running
    """
    manager = ScanJobManager(db)
    manager.start_scan_job(scan_job_id)
    
    return {
        "message": "Scan job started",
        "scan_job_id": scan_job_id
    }


@app.post("/scraper/complete-scan-job/{scan_job_id}")
async def complete_scan_job_endpoint(
    scan_job_id: int,
    people_found: int,
    emails_discovered: int,
    emails_validated: int,
    emails_rejected_role: int = 0,
    emails_rejected_domain: int = 0,
    emails_rejected_quality: int = 0,
    db: Session = Depends(get_db)
):
    """
    Direct access to ScanJobManager.complete_scan_job()
    Mark scan job as completed with stats
    """
    manager = ScanJobManager(db)
    manager.complete_scan_job(
        scan_job_id=scan_job_id,
        people_found=people_found,
        emails_discovered=emails_discovered,
        emails_validated=emails_validated,
        emails_rejected_role=emails_rejected_role,
        emails_rejected_domain=emails_rejected_domain,
        emails_rejected_quality=emails_rejected_quality
    )
    
    return {
        "message": "Scan job completed",
        "scan_job_id": scan_job_id
    }


@app.post("/scraper/fail-scan-job/{scan_job_id}")
async def fail_scan_job_endpoint(
    scan_job_id: int,
    error_message: str,
    db: Session = Depends(get_db)
):
    """
    Direct access to ScanJobManager.fail_scan_job()
    Mark scan job as failed
    """
    manager = ScanJobManager(db)
    manager.fail_scan_job(scan_job_id, error_message)
    
    return {
        "message": "Scan job marked as failed",
        "scan_job_id": scan_job_id,
        "error": error_message
    }


@app.post("/scraper/update-scan-progress/{scan_job_id}")
async def update_scan_progress_manual(
    scan_job_id: int,
    progress: int,
    current_step: str,
    db: Session = Depends(get_db)
):
    """
    Direct access to ScanJobManager.update_scan_progress()
    """
    manager = ScanJobManager(db)
    manager.update_scan_progress(scan_job_id, progress, current_step)
    
    return {
        "message": "Progress updated",
        "scan_job_id": scan_job_id,
        "progress": progress
    }


# ============================================================================
# NEW: Email Validator Direct Access Endpoints
# ============================================================================

@app.post("/validator/validate-email-format")
async def validate_email_format_endpoint(request: EmailCheckRequest):
    """
    Direct access to validate_email_format()
    Basic RFC 5322 email format validation
    """
    is_valid = validate_email_format(request.email)
    
    return {
        "email": request.email,
        "is_valid_format": is_valid,
        "reason": "Valid email format" if is_valid else "Invalid email format"
    }


@app.post("/validator/validate-email")
async def validate_email_endpoint(request: EmailValidationRequest):
    """
    Direct access to validate_email_full()
    Validate a single email with full validation pipeline
    """
    validation = validate_email_full(
        request.email,
        request.company_domain,
        role_confidence=request.role_confidence,
        discovery_method=request.discovery_method,
        page_credibility=request.page_credibility,
        check_mx=request.check_mx,
        check_smtp=request.check_smtp
    )
    
    return validation


@app.post("/validator/batch-validate")
async def batch_validate_endpoint(request: BatchEmailValidationRequest):
    """
    Direct access to batch_validate_emails()
    Validate multiple emails at once
    """
    results = batch_validate_emails(
        request.emails,
        request.company_domain,
        check_mx=request.check_mx,
        check_smtp=request.check_smtp
    )
    
    return {
        "total": len(request.emails),
        "valid": len(results['valid']),
        "invalid": len(results['invalid']),
        "risky": len(results['risky']),
        "results": results
    }


@app.post("/validator/check-blocked-prefix")
async def check_blocked_prefix_endpoint(request: EmailCheckRequest):
    """
    Direct access to is_blocked_prefix()
    Check if email has blocked prefix (info@, support@, etc.)
    """
    is_blocked = is_blocked_prefix(request.email)
    
    return {
        "email": request.email,
        "is_blocked": is_blocked,
        "reason": "Email has blocked prefix" if is_blocked else "Prefix allowed"
    }


@app.post("/validator/check-domain-match")
async def check_domain_match_endpoint(email: str, company_domain: str):
    """
    Direct access to is_company_domain_match()
    Check if email domain matches company domain
    """
    matches = is_company_domain_match(email, company_domain)
    
    return {
        "email": email,
        "company_domain": company_domain,
        "matches": matches
    }


@app.post("/validator/check-blocked-domain")
async def check_blocked_domain_endpoint(request: EmailCheckRequest):
    """
    Direct access to is_blocked_domain()
    Check if email is from blocked domain (Gmail, Yahoo, etc.)
    """
    is_blocked = is_blocked_domain(request.email)
    
    return {
        "email": request.email,
        "is_blocked": is_blocked,
        "reason": "Personal email domain blocked" if is_blocked else "Domain allowed"
    }


@app.post("/validator/check-disposable")
async def check_disposable_endpoint(request: EmailCheckRequest):
    """
    Direct access to is_disposable_email()
    Check if email is from disposable domain
    """
    is_disposable = is_disposable_email(request.email)
    
    return {
        "email": request.email,
        "is_disposable": is_disposable
    }


@app.post("/validator/check-human-like")
async def check_human_like_endpoint(request: EmailCheckRequest):
    """
    Direct access to is_human_like()
    Check if email matches human-like patterns
    """
    is_human = is_human_like(request.email)
    
    return {
        "email": request.email,
        "is_human_like": is_human
    }


@app.post("/validator/check-mx-record")
async def check_mx_record_endpoint(request: DomainCheckRequest):
    """
    Direct access to check_mx_record()
    Check if domain has valid MX records
    """
    has_mx, mx_host = check_mx_record(request.domain)
    
    return {
        "domain": request.domain,
        "has_mx": has_mx,
        "mx_host": mx_host
    }


@app.post("/validator/verify-smtp")
async def verify_smtp_endpoint(request: EmailCheckRequest):
    """
    Direct access to verify_smtp()
    Verify email via SMTP (without sending)
    """
    is_valid, message = verify_smtp(request.email)
    
    return {
        "email": request.email,
        "is_valid": is_valid,
        "message": message
    }


@app.post("/validator/calculate-confidence")
async def calculate_confidence_endpoint(
    email: str,
    domain_match: bool,
    role_confidence: float,
    discovery_method: str,
    page_credibility: float,
    mx_valid: bool
):
    """
    Direct access to calculate_confidence_score()
    Calculate email confidence score
    """
    score, level = calculate_confidence_score(
        email,
        domain_match,
        role_confidence,
        discovery_method,
        page_credibility,
        mx_valid
    )
    
    return {
        "email": email,
        "confidence_score": score,
        "confidence_level": level
    }


@app.post("/validator/check-allowed-role")
async def check_allowed_role_endpoint(request: RoleCheckRequest):
    """
    Direct access to is_allowed_role()
    Check if role is in DECISION_MAKER_ROLES
    """
    is_allowed = is_allowed_role(request.role)
    
    return {
        "role": request.role,
        "is_allowed": is_allowed,
        "reason": "Role is a decision-maker" if is_allowed else "Role not in decision-maker list"
    }


@app.post("/validator/normalize-role")
async def normalize_role_endpoint(request: RoleCheckRequest):
    """
    Direct access to normalize_role()
    Normalize role to match DECISION_MAKER_ROLES
    """
    normalized = normalize_role(request.role)
    
    return {
        "original_role": request.role,
        "normalized_role": normalized,
        "is_valid": normalized is not None
    }


@app.get("/validator/decision-maker-roles")
async def get_decision_maker_roles():
    """Get list of all allowed decision-maker roles"""
    return {
        "roles": sorted(list(DECISION_MAKER_ROLES)),
        "count": len(DECISION_MAKER_ROLES)
    }


@app.get("/validator/blocked-prefixes")
async def get_blocked_prefixes():
    """Get list of all blocked email prefixes"""
    return {
        "prefixes": sorted(BLOCKED_PREFIXES),
        "count": len(BLOCKED_PREFIXES)
    }


@app.get("/validator/blocked-domains")
async def get_blocked_domains():
    """Get list of all blocked domains"""
    return {
        "domains": sorted(BLOCKED_DOMAINS),
        "count": len(BLOCKED_DOMAINS)
    }


@app.get("/validator/disposable-domains")
async def get_disposable_domains():
    """Get list of all disposable email domains"""
    return {
        "domains": sorted(DISPOSABLE_DOMAINS),
        "count": len(DISPOSABLE_DOMAINS)
    }


@app.get("/validator/human-email-patterns")
async def get_human_email_patterns():
    """Get list of human-like email patterns"""
    return {
        "patterns": HUMAN_EMAIL_PATTERNS,
        "count": len(HUMAN_EMAIL_PATTERNS)
    }


# ============================================================================
# NEW: Email Sender Direct Access Endpoints
# ============================================================================

@app.post("/sender/send-single-email")
async def send_single_email_endpoint(
    to_email: str,
    subject: str,
    body: str,
    from_email: str,
    from_name: Optional[str] = None
):
    """
    Direct access to EmailSender.send_email()
    Send a single email immediately via SMTP
    """
    sender = EmailSender()
    result = sender.send_email(
        to_email=to_email,
        subject=subject,
        body=body,
        from_email=from_email,
        from_name=from_name
    )
    
    return result


@app.get("/sender/domain-cooldown/{domain}")
async def check_domain_cooldown_endpoint(
    domain: str,
    cooldown_days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailCampaignSender.check_domain_cooldown()
    Check if domain is in cooldown period
    """
    sender = EmailCampaignSender(db)
    can_contact = sender.check_domain_cooldown(domain, cooldown_days)
    
    cooldown = db.query(DomainCooldown).filter(
        DomainCooldown.domain == domain
    ).first()
    
    return {
        "domain": domain,
        "can_contact": can_contact,
        "last_contacted": cooldown.last_contacted if cooldown else None,
        "contact_count": cooldown.contact_count if cooldown else 0
    }


@app.post("/sender/update-domain-cooldown/{domain}")
async def update_domain_cooldown_endpoint(
    domain: str,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailCampaignSender.update_domain_cooldown()
    Update domain cooldown timestamp
    """
    sender = EmailCampaignSender(db)
    sender.update_domain_cooldown(domain)
    
    return {
        "message": "Domain cooldown updated",
        "domain": domain
    }


@app.get("/sender/eligible-emails/{campaign_id}")
async def get_eligible_emails_endpoint(
    campaign_id: int,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailCampaignSender.get_eligible_emails()
    Get emails eligible for sending in campaign
    """
    sender = EmailCampaignSender(db)
    eligible = sender.get_eligible_emails(campaign_id, limit)
    
    return {
        "campaign_id": campaign_id,
        "eligible_count": len(eligible),
        "emails": [{
            "id": e.id,
            "email_address": e.email_address,
            "person_name": e.person.full_name if e.person else None
        } for e in eligible]
    }


@app.post("/sender/send-campaign-batch/{campaign_id}")
async def send_campaign_batch_endpoint(
    campaign_id: int,
    daily_limit: int = 100,
    delay_seconds: float = 2.0,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Direct access to EmailCampaignSender.send_campaign_batch()
    Send a batch of emails with custom settings
    """
    sender = EmailCampaignSender(db)
    
    if background_tasks:
        def send_task():
            result = sender.send_campaign_batch(
                campaign_id=campaign_id,
                daily_limit=daily_limit,
                delay_seconds=delay_seconds
            )
            return result
        
        background_tasks.add_task(send_task)
        return {
            "message": "Campaign batch send started in background",
            "campaign_id": campaign_id,
            "daily_limit": daily_limit
        }
    else:
        result = sender.send_campaign_batch(
            campaign_id=campaign_id,
            daily_limit=daily_limit,
            delay_seconds=delay_seconds
        )
        return result


@app.post("/sender/finalize-send-run")
async def finalize_send_run_endpoint(db: Session = Depends(get_db)):
    """
    Direct access to EmailCampaignSender.finalize_send_run()
    Reset queued emails back to draft
    """
    sender = EmailCampaignSender(db)
    reset_count = sender.finalize_send_run()
    
    return {
        "message": "Send run finalized",
        "emails_reset": reset_count
    }


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
    ONLY RETURNS VALIDATED EMAILS
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
    
    company = db.query(Company).filter(Company.id == email.company_id).first()
    
    validation = validate_email_full(
        email.email_address,
        company.domain,
        role_confidence=email.person.role_confidence if email.person else 1.0,
        discovery_method=email.discovery_method,
        check_mx=True,
        check_smtp=check_smtp
    )
    
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
    """Verify multiple emails in bulk"""
    emails_to_verify = db.query(Email).filter(
        Email.id.in_(request.email_ids),
        Email.discovery_status == EmailDiscoveryStatus.VALIDATED
    ).all()
    
    if not emails_to_verify:
        raise HTTPException(status_code=404, detail="No emails found")
    
    job = EmailVerificationJob(
        email_ids=json.dumps(request.email_ids),
        total_emails=len(request.email_ids),
        status='pending'
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
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
    manager = CampaignManager(db)
    success = manager.start_campaign(campaign_id)
    
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
    
    def send_task():
        sender = EmailCampaignSender(db)
        sender.send_campaign_batch(request.campaign_id, request.daily_limit)
    
    background_tasks.add_task(send_task)
    
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
    sender = EmailCampaignSender(db)
    status = sender.get_batch_status(batch_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    return status


# ============================================================================
# Statistics Endpoints
# ============================================================================

@app.get("/stats/overview")
async def get_overview_stats(db: Session = Depends(get_db)):
    """Get overall system statistics"""
    total_companies = db.query(Company).count()
    total_people = db.query(Person).count()
    
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
    sender = EmailCampaignSender(db)
    reset_count = sender.finalize_send_run()
    
    return {
        "message": "Queue reset complete",
        "emails_reset": reset_count
    }


# ============================================================================
# NEW: Database Model Access Endpoints
# ============================================================================

@app.get("/database/domain-cooldowns")
async def list_domain_cooldowns(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all domain cooldowns"""
    cooldowns = db.query(DomainCooldown).offset(skip).limit(limit).all()
    
    return [{
        "id": c.id,
        "domain": c.domain,
        "last_contacted": c.last_contacted,
        "cooldown_days": c.cooldown_days,
        "contact_count": c.contact_count,
        "created_at": c.created_at
    } for c in cooldowns]


@app.get("/database/send-logs")
async def list_send_logs(
    campaign_id: Optional[int] = None,
    email_id: Optional[int] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List send logs with filters"""
    query = db.query(SendLog)
    
    if campaign_id:
        query = query.filter(SendLog.campaign_id == campaign_id)
    
    if email_id:
        query = query.filter(SendLog.email_id == email_id)
    
    if status:
        query = query.filter(SendLog.status == status)
    
    logs = query.order_by(SendLog.sent_at.desc()).offset(skip).limit(limit).all()
    
    return [{
        "id": log.id,
        "email_address": log.email.email_address if log.email else None,
        "campaign_name": log.campaign.name if log.campaign else None,
        "sent_at": log.sent_at,
        "status": log.status,
        "error_message": log.error_message,
        "subject_sent": log.subject_sent
    } for log in logs]


@app.get("/database/verification-jobs")
async def list_verification_jobs(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """List email verification jobs"""
    query = db.query(EmailVerificationJob)
    
    if status:
        query = query.filter(EmailVerificationJob.status == status)
    
    jobs = query.order_by(EmailVerificationJob.created_at.desc()).offset(skip).limit(limit).all()
    
    return [{
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
    } for job in jobs]


@app.delete("/database/clear-domain-cooldown/{domain}")
async def clear_domain_cooldown(domain: str, db: Session = Depends(get_db)):
    """Clear cooldown for a specific domain"""
    cooldown = db.query(DomainCooldown).filter(DomainCooldown.domain == domain).first()
    
    if not cooldown:
        raise HTTPException(status_code=404, detail="Domain cooldown not found")
    
    db.delete(cooldown)
    db.commit()
    
    return {
        "message": "Domain cooldown cleared",
        "domain": domain
    }


# ============================================================================
# NEW: System Configuration Endpoints
# ============================================================================

@app.get("/config/constants")
async def get_system_constants():
    """Get all system constants and configuration"""
    return {
        "decision_maker_roles": sorted(list(DECISION_MAKER_ROLES)),
        "blocked_prefixes": sorted(BLOCKED_PREFIXES),
        "blocked_domains": sorted(BLOCKED_DOMAINS),
        "disposable_domains": sorted(DISPOSABLE_DOMAINS),
        "human_email_patterns": HUMAN_EMAIL_PATTERNS,
        "email_statuses": [s.value for s in EmailStatus],
        "discovery_statuses": [s.value for s in EmailDiscoveryStatus],
        "campaign_statuses": [s.value for s in CampaignStatus],
        "scan_statuses": [s.value for s in ScanStatus],
        "verification_statuses": [s.value for s in VerificationStatus],
        "send_statuses": [s.value for s in SendStatus]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)