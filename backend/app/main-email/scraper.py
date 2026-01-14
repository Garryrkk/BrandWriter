"""
Email scraping module with scan job management
Extracts emails from websites, LinkedIn, and other sources
Tracks scan progress and status
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
import time
import json
from datetime import datetime
from sqlalchemy.orm import Session

from email_validator import (
    validate_email_full, 
    is_allowed_role, 
    is_blocked_prefix
)
from database import (
    Company, Email, ScanJob, ScanStatus,
    EmailStatus, VerificationStatus
)

# User agent for requests
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Pages to avoid (contact forms, legal, etc.)
BLOCKED_PATHS = [
    '/contact', '/about/contact', '/get-in-touch',
    '/legal', '/privacy', '/terms', '/security',
    '/support', '/help', '/faq', '/download',
    '/pricing', '/blog', '/news', '/press'
]


class ScanJobManager:
    """Manages scan jobs with progress tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_scan_job(
        self,
        company_id: int,
        scan_website: bool = True,
        scan_linkedin: bool = False,
        max_pages: int = 5
    ) -> ScanJob:
        """Create a new scan job"""
        scan_job = ScanJob(
            company_id=company_id,
            status=ScanStatus.PENDING,
            scan_website=scan_website,
            scan_linkedin=scan_linkedin,
            max_pages=max_pages
        )
        self.db.add(scan_job)
        self.db.commit()
        self.db.refresh(scan_job)
        return scan_job
    
    def update_scan_progress(
        self,
        scan_job_id: int,
        progress: int,
        current_step: str
    ):
        """Update scan job progress"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.progress_percentage = progress
            scan_job.current_step = current_step
            self.db.commit()
    
    def start_scan_job(self, scan_job_id: int):
        """Mark scan job as running"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.RUNNING
            scan_job.started_at = datetime.utcnow()
            self.db.commit()
    
    def complete_scan_job(
        self,
        scan_job_id: int,
        emails_found: int,
        emails_valid: int
    ):
        """Mark scan job as completed"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.COMPLETED
            scan_job.completed_at = datetime.utcnow()
            scan_job.emails_found = emails_found
            scan_job.emails_valid = emails_valid
            scan_job.progress_percentage = 100
            self.db.commit()
    
    def fail_scan_job(self, scan_job_id: int, error_message: str):
        """Mark scan job as failed"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.FAILED
            scan_job.error_message = error_message
            scan_job.completed_at = datetime.utcnow()
            self.db.commit()
    
    def get_scan_status(self, scan_job_id: int) -> Dict:
        """Get scan job status and progress"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if not scan_job:
            return None
        
        return {
            'id': scan_job.id,
            'status': scan_job.status,
            'progress_percentage': scan_job.progress_percentage,
            'current_step': scan_job.current_step,
            'emails_found': scan_job.emails_found,
            'emails_valid': scan_job.emails_valid,
            'error_message': scan_job.error_message,
            'started_at': scan_job.started_at,
            'completed_at': scan_job.completed_at
        }


class EmailScraper:
    """Scrapes emails from company websites and sources"""
    
    def __init__(self, db: Session, rate_limit: float = 2.0):
        self.db = db
        self.rate_limit = rate_limit
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.scan_manager = ScanJobManager(db)
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL should be scraped"""
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        # Skip blocked paths
        return not any(blocked in path for blocked in BLOCKED_PATHS)
    
    def _extract_emails_from_text(self, text: str) -> Set[str]:
        """Extract email addresses from text using regex"""
        # Email regex pattern
        pattern = r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
        emails = set(re.findall(pattern, text))
        
        # Filter out blocked prefixes immediately
        valid_emails = set()
        for email in emails:
            if not is_blocked_prefix(email):
                valid_emails.add(email.lower())
        
        return valid_emails
    
    def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch page content with rate limiting"""
        try:
            time.sleep(self.rate_limit)
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"Error fetching {url}: {e}")
            return None
    
    def scrape_website(
        self,
        url: str,
        company_id: int,
        scan_job_id: int,
        max_pages: int = 5
    ) -> List[Dict]:
        """
        Scrape emails from website with progress tracking
        Returns list of email data dictionaries
        """
        if not self._is_valid_url(url):
            return []
        
        domain = urlparse(url).netloc
        emails_found = []
        visited_urls = set()
        to_visit = [url]
        
        self.scan_manager.update_scan_progress(
            scan_job_id,
            10,
            f"Starting website scan: {url}"
        )
        
        page_count = 0
        while to_visit and page_count < max_pages:
            current_url = to_visit.pop(0)
            
            if current_url in visited_urls:
                continue
            
            visited_urls.add(current_url)
            page_count += 1
            
            # Update progress
            progress = 10 + int((page_count / max_pages) * 60)
            self.scan_manager.update_scan_progress(
                scan_job_id,
                progress,
                f"Scanning page {page_count}/{max_pages}: {current_url}"
            )
            
            html = self._fetch_page(current_url)
            
            if not html:
                continue
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract emails from text
            emails = self._extract_emails_from_text(soup.get_text())
            
            for email in emails:
                # Only keep emails from same domain
                if domain in email:
                    emails_found.append({
                        'email': email,
                        'source': current_url,
                        'domain': domain
                    })
            
            # Find more pages on same domain
            if page_count < max_pages:
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(current_url, href)
                    
                    # Only visit same domain
                    if domain in full_url and self._is_valid_url(full_url):
                        if full_url not in visited_urls and len(to_visit) < 20:
                            to_visit.append(full_url)
        
        return emails_found
    
    def enrich_email_with_role(self, email: str, website: str) -> Optional[str]:
        """
        Try to find role/title associated with email
        Returns role if found
        """
        html = self._fetch_page(website)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text().lower()
        
        # Look for email near role keywords
        email_index = text.find(email.lower())
        if email_index == -1:
            return None
        
        # Get context around email (500 chars before and after)
        context = text[max(0, email_index-500):email_index+500]
        
        # Common role patterns
        role_patterns = [
            r'(ceo|cto|founder|co-founder|chief)',
            r'(head of \w+)',
            r'(director of \w+)',
            r'(vp of \w+)',
            r'(engineering manager)',
            r'(product manager)',
            r'(staff engineer)'
        ]
        
        for pattern in role_patterns:
            match = re.search(pattern, context)
            if match:
                role = match.group(0)
                if is_allowed_role(role):
                    return role.title()
        
        return None
    
    def run_full_scan(
        self,
        company_id: int,
        scan_website: bool = True,
        scan_linkedin: bool = False,
        max_pages: int = 5,
        verify_emails: bool = True
    ) -> Dict:
        """
        Run complete scan job for a company
        Returns scan results
        """
        # Get company
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return {'error': 'Company not found'}
        
        # Create scan job
        scan_job = self.scan_manager.create_scan_job(
            company_id=company_id,
            scan_website=scan_website,
            scan_linkedin=scan_linkedin,
            max_pages=max_pages
        )
        
        try:
            # Start scan
            self.scan_manager.start_scan_job(scan_job.id)
            
            all_emails = []
            
            # Scrape website
            if scan_website and company.website:
                self.scan_manager.update_scan_progress(
                    scan_job.id,
                    5,
                    "Starting website scan"
                )
                website_emails = self.scrape_website(
                    company.website,
                    company_id,
                    scan_job.id,
                    max_pages
                )
                all_emails.extend(website_emails)
            
            # Scrape LinkedIn (placeholder)
            if scan_linkedin and company.linkedin:
                self.scan_manager.update_scan_progress(
                    scan_job.id,
                    70,
                    "Starting LinkedIn scan"
                )
                # LinkedIn scraping would go here
                pass
            
            # Deduplicate
            self.scan_manager.update_scan_progress(
                scan_job.id,
                80,
                "Deduplicating emails"
            )
            
            unique_emails = {}
            for email_data in all_emails:
                email = email_data['email']
                if email not in unique_emails:
                    unique_emails[email] = email_data
            
            # Validate and save emails
            self.scan_manager.update_scan_progress(
                scan_job.id,
                85,
                "Validating emails"
            )
            
            emails_saved = 0
            emails_valid = 0
            
            for idx, (email, email_data) in enumerate(unique_emails.items()):
                # Check if email already exists
                existing = self.db.query(Email).filter(
                    Email.email_address == email
                ).first()
                
                if existing:
                    continue
                
                # Validate email
                validation = validate_email_full(
                    email,
                    check_mx=verify_emails,
                    check_smtp=False
                )
                
                if not validation['is_valid']:
                    continue
                
                # Try to enrich with role
                role = None
                if company.website:
                    role = self.enrich_email_with_role(email, company.website)
                
                # Save email
                db_email = Email(
                    email_address=email,
                    company_id=company_id,
                    scan_job_id=scan_job.id,
                    status=EmailStatus.SCRAPED,
                    verification_status=(
                        VerificationStatus.VALID if validation['is_valid']
                        else VerificationStatus.INVALID
                    ),
                    quality_score=validation['quality_score'],
                    is_validated=verify_emails,
                    mx_valid=validation['mx_valid'],
                    is_role_email=validation['is_role_email'],
                    is_disposable=validation['is_disposable'],
                    role=role,
                    verified_at=datetime.utcnow() if verify_emails else None
                )
                
                self.db.add(db_email)
                emails_saved += 1
                
                if validation['is_valid']:
                    emails_valid += 1
                
                # Update progress periodically
                if idx % 10 == 0:
                    progress = 85 + int((idx / len(unique_emails)) * 10)
                    self.scan_manager.update_scan_progress(
                        scan_job.id,
                        progress,
                        f"Validated {idx}/{len(unique_emails)} emails"
                    )
            
            self.db.commit()
            
            # Update company last_scanned
            company.last_scanned = datetime.utcnow()
            self.db.commit()
            
            # Complete scan job
            self.scan_manager.complete_scan_job(
                scan_job.id,
                emails_found=len(unique_emails),
                emails_valid=emails_valid
            )
            
            return {
                'scan_job_id': scan_job.id,
                'status': 'completed',
                'emails_found': len(unique_emails),
                'emails_saved': emails_saved,
                'emails_valid': emails_valid
            }
            
        except Exception as e:
            # Fail scan job
            self.scan_manager.fail_scan_job(scan_job.id, str(e))
            return {
                'scan_job_id': scan_job.id,
                'status': 'failed',
                'error': str(e)
            }


def start_scan(
    db: Session,
    company_id: int,
    scan_website: bool = True,
    scan_linkedin: bool = False,
    max_pages: int = 5,
    verify_emails: bool = True
) -> Dict:
    """
    Main function to start a scan job
    Can be called from API or background task
    """
    scraper = EmailScraper(db)
    return scraper.run_full_scan(
        company_id=company_id,
        scan_website=scan_website,
        scan_linkedin=scan_linkedin,
        max_pages=max_pages,
        verify_emails=verify_emails
    )


def get_scan_status(db: Session, scan_job_id: int) -> Optional[Dict]:
    """Get status of a scan job"""
    manager = ScanJobManager(db)
    return manager.get_scan_status(scan_job_id)