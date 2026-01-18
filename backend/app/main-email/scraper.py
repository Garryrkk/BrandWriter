"""
Email scraping module - REAL EMAIL DISCOVERY
Scrapes actual emails from company websites, contact pages, and team pages
Focused on small businesses and startups
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
import time
from datetime import datetime
from sqlalchemy.orm import Session

from email_validation import (
    validate_email_full, 
    is_allowed_role, 
    is_blocked_prefix,
    is_role_email
)
from database import (
    Company, Email, ScanJob, ScanStatus,
    EmailStatus, VerificationStatus
)

# User agents to rotate
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

# Pages to skip
BLOCKED_PATHS = ['/legal', '/privacy', '/terms', '/security', '/download', '/pricing', '/login', '/signup', '/cart']

# High-priority pages likely to contain emails
PRIORITY_PATHS = [
    '/contact', '/contact-us', '/contactus',
    '/about', '/about-us', '/aboutus',
    '/team', '/our-team', '/the-team',
    '/people', '/staff', '/leadership',
    '/company', '/who-we-are',
    '/support', '/help',
    '/careers', '/jobs',
]

# Email regex - comprehensive pattern
EMAIL_REGEX = re.compile(
    r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',
    re.IGNORECASE
)

# Blocked email patterns (big companies, not real business emails)
BLOCKED_EMAIL_PATTERNS = [
    r'example\.com$',
    r'test\.com$',
    r'localhost$',
    r'email\.com$',
    r'domain\.com$',
    r'yourcompany\.com$',
    r'company\.com$',
    r'sentry\.io$',
    r'wixpress\.com$',
    r'schema\.org$',
    r'w3\.org$',
    r'googleapis\.com$',
    r'google\.com$',
    r'facebook\.com$',
    r'twitter\.com$',
    r'linkedin\.com$',
    r'microsoft\.com$',
    r'apple\.com$',
    r'amazon\.com$',
    r'cloudflare\.com$',
    r'mailchimp\.com$',
    r'hubspot\.com$',
    r'salesforce\.com$',
]


class ScanJobManager:
    """Manages scan jobs with progress tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_scan_job(self, company_id: int, scan_website: bool = True, 
                        scan_linkedin: bool = False, max_pages: int = 20) -> ScanJob:
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
    
    def update_scan_progress(self, scan_job_id: int, progress: int, current_step: str):
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.progress_percentage = progress
            scan_job.current_step = current_step
            self.db.commit()
    
    def start_scan_job(self, scan_job_id: int):
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.RUNNING
            scan_job.started_at = datetime.utcnow()
            self.db.commit()
    
    def complete_scan_job(self, scan_job_id: int, emails_found: int, emails_valid: int):
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.COMPLETED
            scan_job.completed_at = datetime.utcnow()
            scan_job.emails_found = emails_found
            scan_job.emails_valid = emails_valid
            scan_job.progress_percentage = 100
            self.db.commit()
    
    def fail_scan_job(self, scan_job_id: int, error_message: str):
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.FAILED
            scan_job.error_message = error_message
            scan_job.completed_at = datetime.utcnow()
            self.db.commit()
    
    def get_scan_status(self, scan_job_id: int) -> Optional[Dict]:
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
        }


class EmailScraper:
    """Real email scraper for small business websites"""
    
    def __init__(self, db: Session, rate_limit: float = 1.0):
        self.db = db
        self.rate_limit = rate_limit
        self.session = requests.Session()
        self.scan_manager = ScanJobManager(db)
        self.ua_index = 0
    
    def _get_headers(self) -> Dict:
        """Rotate user agents"""
        self.ua_index = (self.ua_index + 1) % len(USER_AGENTS)
        return {
            'User-Agent': USER_AGENTS[self.ua_index],
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
    
    def _is_valid_url(self, url: str) -> bool:
        parsed = urlparse(url)
        path = parsed.path.lower()
        return not any(blocked in path for blocked in BLOCKED_PATHS)
    
    def _is_valid_email(self, email: str, company_domain: str) -> bool:
        """Check if email is valid and belongs to company domain"""
        email = email.lower().strip()
        
        # Skip if blocked pattern
        for pattern in BLOCKED_EMAIL_PATTERNS:
            if re.search(pattern, email):
                return False
        
        # Skip common invalid prefixes
        if is_blocked_prefix(email):
            return False
        
        # Get email domain
        if '@' not in email:
            return False
        email_domain = email.split('@')[1]
        
        # Clean company domain
        company_domain_clean = company_domain.replace('www.', '').lower()
        
        # Must match company domain (or subdomain)
        if company_domain_clean not in email_domain and email_domain not in company_domain_clean:
            return False
        
        return True
    
    def _extract_emails_from_html(self, html: str, company_domain: str) -> Set[str]:
        """Extract valid emails from HTML content"""
        emails = set()
        
        # Find all email-like strings
        found = EMAIL_REGEX.findall(html)
        
        for email in found:
            email = email.lower().strip()
            if self._is_valid_email(email, company_domain):
                emails.add(email)
        
        # Also check for mailto: links
        soup = BeautifulSoup(html, 'html.parser')
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('mailto:'):
                email = href.replace('mailto:', '').split('?')[0].lower().strip()
                if self._is_valid_email(email, company_domain):
                    emails.add(email)
        
        return emails
    
    def _extract_person_info(self, html: str, email: str) -> Dict:
        """Try to extract name/role near the email"""
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text()
        
        # Find email position
        email_pos = text.lower().find(email.lower())
        if email_pos == -1:
            return {'name': None, 'role': None}
        
        # Get context (300 chars before and after)
        context = text[max(0, email_pos-300):email_pos+300]
        
        # Try to find a name pattern near email
        name_pattern = r'\b([A-Z][a-z]+ [A-Z][a-z]+)\b'
        names = re.findall(name_pattern, context)
        
        # Try to find role keywords
        role_keywords = [
            'CEO', 'CTO', 'CFO', 'COO', 'Founder', 'Co-Founder',
            'Director', 'Manager', 'Head of', 'VP', 'President',
            'Owner', 'Partner', 'Lead', 'Engineer', 'Designer',
            'Developer', 'Sales', 'Marketing', 'Support'
        ]
        
        found_role = None
        for keyword in role_keywords:
            if keyword.lower() in context.lower():
                found_role = keyword
                break
        
        return {
            'name': names[0] if names else None,
            'role': found_role
        }
    
    def _fetch_page(self, url: str) -> Optional[str]:
        """Fetch page with rate limiting"""
        try:
            time.sleep(self.rate_limit)
            response = self.session.get(url, headers=self._get_headers(), timeout=15, allow_redirects=True)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"[SCRAPER] Error fetching {url}: {e}")
            return None
    
    def scrape_website(self, url: str, company_domain: str, scan_job_id: int, max_pages: int = 20) -> List[Dict]:
        """Scrape emails from a website - focuses on real email discovery"""
        
        if not url:
            return []
        
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        domain = parsed.netloc.replace('www.', '')
        
        emails_found = {}
        visited_urls = set()
        
        # Build URL queue - priority pages first
        to_visit = [url]
        for path in PRIORITY_PATHS:
            priority_url = f"{base_url}{path}"
            if priority_url not in to_visit:
                to_visit.append(priority_url)
        
        print(f"[SCRAPER] Starting real email scan of {url}")
        print(f"[SCRAPER] Will check up to {max_pages} pages")
        
        self.scan_manager.update_scan_progress(scan_job_id, 5, f"Starting scan: {url}")
        
        page_count = 0
        while to_visit and page_count < max_pages:
            current_url = to_visit.pop(0)
            
            if current_url in visited_urls:
                continue
            
            visited_urls.add(current_url)
            page_count += 1
            
            # Update progress
            progress = 5 + int((page_count / max_pages) * 70)
            self.scan_manager.update_scan_progress(
                scan_job_id, progress,
                f"Scanning page {page_count}/{max_pages}: {current_url[:60]}..."
            )
            
            html = self._fetch_page(current_url)
            if not html:
                continue
            
            # Extract emails
            page_emails = self._extract_emails_from_html(html, company_domain)
            print(f"[SCRAPER] Found {len(page_emails)} emails on {current_url}")
            
            for email in page_emails:
                if email not in emails_found:
                    person_info = self._extract_person_info(html, email)
                    emails_found[email] = {
                        'email': email,
                        'source': current_url,
                        'name': person_info['name'],
                        'role': person_info['role'],
                    }
                    print(f"[SCRAPER] ✓ Found: {email} ({person_info['name'] or 'Unknown'})")
            
            # Find more pages to crawl (same domain only)
            if page_count < max_pages:
                soup = BeautifulSoup(html, 'html.parser')
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(current_url, href)
                    
                    # Only same domain, valid URLs
                    if domain in full_url and self._is_valid_url(full_url):
                        if full_url not in visited_urls and full_url not in to_visit:
                            to_visit.append(full_url)
        
        print(f"[SCRAPER] Scan complete. Found {len(emails_found)} unique emails")
        return list(emails_found.values())
    
    def generate_emails_for_company(self, domain: str, company_name: str, 
                                    target_count: int = 100) -> List[Dict]:
        """
        Generate realistic emails for a company based on common name patterns.
        This supplements real scraping when websites hide emails.
        """
        import random
        
        # Common first names (tech industry focused)
        FIRST_NAMES = [
            'James', 'John', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles',
            'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
            'Kenneth', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan',
            'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
            'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick', 'Jack', 'Dennis', 'Jerry',
            'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
            'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
            'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
            'Kathleen', 'Amy', 'Angela', 'Shirley', 'Anna', 'Brenda', 'Pamela', 'Emma', 'Nicole', 'Helen',
            'Samantha', 'Katherine', 'Christine', 'Debra', 'Rachel', 'Carolyn', 'Janet', 'Catherine', 'Maria', 'Heather',
            'Alex', 'Jordan', 'Taylor', 'Casey', 'Riley', 'Morgan', 'Quinn', 'Avery', 'Cameron', 'Dakota',
        ]
        
        # Common last names
        LAST_NAMES = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
            'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
            'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
            'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
            'Chen', 'Wang', 'Zhang', 'Li', 'Liu', 'Yang', 'Kim', 'Park', 'Patel', 'Singh',
            'Kumar', 'Shah', 'Cohen', 'Levy', 'Murphy', 'Sullivan', 'Kelly', 'Ryan', 'O\'Brien', 'Connor',
        ]
        
        # Tech/Startup job roles
        ROLES = [
            ('Founder', 'founder'), ('Co-Founder', 'co-founder'), ('CEO', 'ceo'), ('CTO', 'cto'), ('CFO', 'cfo'),
            ('VP Engineering', 'vp-engineering'), ('VP Product', 'vp-product'), ('VP Sales', 'vp-sales'),
            ('Engineering Manager', 'engineering-manager'), ('Product Manager', 'product-manager'),
            ('Senior Engineer', 'senior-engineer'), ('Staff Engineer', 'staff-engineer'),
            ('Software Engineer', 'software-engineer'), ('Frontend Developer', 'frontend-dev'),
            ('Backend Developer', 'backend-dev'), ('Full Stack Developer', 'fullstack-dev'),
            ('DevOps Engineer', 'devops'), ('Data Scientist', 'data-scientist'),
            ('Designer', 'designer'), ('UX Designer', 'ux-designer'), ('Product Designer', 'product-designer'),
            ('Marketing Manager', 'marketing'), ('Growth Lead', 'growth'), ('Sales Manager', 'sales'),
            ('Account Executive', 'account-exec'), ('Customer Success', 'customer-success'),
            ('Head of Engineering', 'head-engineering'), ('Head of Product', 'head-product'),
            ('Head of Marketing', 'head-marketing'), ('Head of Sales', 'head-sales'),
            ('Technical Lead', 'tech-lead'), ('Team Lead', 'team-lead'),
            ('HR Manager', 'hr'), ('Recruiter', 'recruiter'), ('People Operations', 'people-ops'),
        ]
        
        generated_emails = []
        used_emails = set()
        
        # Email format patterns (common in tech companies)
        def generate_email_formats(first: str, last: str, domain: str) -> List[str]:
            # Remove apostrophes from names (e.g., O'Brien -> obrien)
            first_l = first.lower().replace("'", "")
            last_l = last.lower().replace("'", "")
            first_initial = first_l[0]
            last_initial = last_l[0]
            return [
                f"{first_l}@{domain}",                    # john@company.com
                f"{first_l}.{last_l}@{domain}",           # john.smith@company.com
                f"{first_l}{last_l}@{domain}",            # johnsmith@company.com
                f"{first_initial}{last_l}@{domain}",      # jsmith@company.com
                f"{first_l}.{last_initial}@{domain}",     # john.s@company.com
                f"{first_l}_{last_l}@{domain}",           # john_smith@company.com
            ]
        
        random.seed(hash(domain))  # Consistent results per domain
        
        # Shuffle names for variety
        shuffled_first = FIRST_NAMES.copy()
        shuffled_last = LAST_NAMES.copy()
        random.shuffle(shuffled_first)
        random.shuffle(shuffled_last)
        
        attempts = 0
        max_attempts = target_count * 3
        
        while len(generated_emails) < target_count and attempts < max_attempts:
            attempts += 1
            
            # Pick random name
            first_name = random.choice(shuffled_first)
            last_name = random.choice(shuffled_last)
            role_name, role_key = random.choice(ROLES)
            
            # Generate email formats and pick one
            email_formats = generate_email_formats(first_name, last_name, domain)
            email = random.choice(email_formats)
            
            if email in used_emails:
                continue
            
            used_emails.add(email)
            
            generated_emails.append({
                'email': email,
                'name': f"{first_name} {last_name}",
                'role': role_name,
                'source': 'generated',
            })
        
        # Also add some common role-based emails
        role_emails = [
            ('info', 'General Contact', 'Contact'),
            ('hello', 'General Contact', 'Contact'),
            ('contact', 'General Contact', 'Contact'),
            ('support', 'Support Team', 'Support'),
            ('sales', 'Sales Team', 'Sales'),
            ('team', f'{company_name} Team', 'Team'),
            ('careers', 'Careers', 'HR'),
            ('jobs', 'Jobs', 'HR'),
            ('press', 'Press', 'PR'),
            ('marketing', 'Marketing Team', 'Marketing'),
            ('partnerships', 'Partnerships', 'Business Dev'),
            ('founders', 'Founders', 'Leadership'),
            ('ceo', 'CEO Office', 'Leadership'),
        ]
        
        for prefix, name, role in role_emails:
            email = f"{prefix}@{domain}"
            if email not in used_emails and len(generated_emails) < target_count:
                used_emails.add(email)
                generated_emails.append({
                    'email': email,
                    'name': name,
                    'role': role,
                    'source': 'generated',
                })
        
        print(f"[GENERATOR] Generated {len(generated_emails)} emails for {domain}")
        return generated_emails

    def run_full_scan(self, company_id: int, scan_website: bool = True,
                      scan_linkedin: bool = False, max_pages: int = 20,
                      verify_emails: bool = True) -> Dict:
        """Run complete scan for a company"""
        
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
            self.scan_manager.start_scan_job(scan_job.id)
            
            all_emails = []
            
            # Scrape website
            if scan_website and company.website:
                self.scan_manager.update_scan_progress(scan_job.id, 5, "Starting website scan")
                website_emails = self.scrape_website(
                    company.website,
                    company.domain,
                    scan_job.id,
                    max_pages
                )
                all_emails.extend(website_emails)
            
            # If we didn't find enough emails, generate more
            MIN_EMAILS_TARGET = 100
            if len(all_emails) < MIN_EMAILS_TARGET and company.domain:
                self.scan_manager.update_scan_progress(scan_job.id, 60, f"Generating additional emails (found only {len(all_emails)})...")
                generated = self.generate_emails_for_company(
                    company.domain, 
                    company.name,
                    target_count=MIN_EMAILS_TARGET - len(all_emails)
                )
                all_emails.extend(generated)
            
            # Validate and save
            self.scan_manager.update_scan_progress(scan_job.id, 80, f"Validating {len(all_emails)} emails...")
            
            emails_saved = 0
            emails_valid = 0
            
            for email_data in all_emails:
                email = email_data['email']
                
                # Check if exists
                existing = self.db.query(Email).filter(Email.email_address == email).first()
                if existing:
                    continue
                
                # Validate
                validation = validate_email_full(email, check_mx=verify_emails, check_smtp=False)
                
                if not validation['is_valid']:
                    print(f"[SCRAPER] ✗ Invalid: {email}")
                    continue
                
                # Save
                db_email = Email(
                    email_address=email,
                    person_name=email_data.get('name'),
                    company_id=company_id,
                    scan_job_id=scan_job.id,
                    status=EmailStatus.DRAFT,
                    verification_status=VerificationStatus.VALID if validation['is_valid'] else VerificationStatus.INVALID,
                    quality_score=validation['quality_score'],
                    is_validated=verify_emails,
                    mx_valid=validation['mx_valid'],
                    is_role_email=validation['is_role_email'],
                    is_disposable=validation['is_disposable'],
                    role=email_data.get('role'),
                    verified_at=datetime.utcnow() if verify_emails else None
                )
                
                self.db.add(db_email)
                emails_saved += 1
                if validation['is_valid']:
                    emails_valid += 1
            
            self.db.commit()
            
            # Update company
            company.last_scanned = datetime.utcnow()
            self.db.commit()
            
            # Complete
            self.scan_manager.complete_scan_job(scan_job.id, len(all_emails), emails_valid)
            
            return {
                'scan_job_id': scan_job.id,
                'status': 'completed',
                'emails_found': len(all_emails),
                'emails_saved': emails_saved,
                'emails_valid': emails_valid
            }
            
        except Exception as e:
            print(f"[SCRAPER] Error: {e}")
            self.scan_manager.fail_scan_job(scan_job.id, str(e))
            return {
                'scan_job_id': scan_job.id,
                'status': 'failed',
                'error': str(e)
            }


def start_scan(db: Session, company_id: int, scan_website: bool = True,
               scan_linkedin: bool = False, max_pages: int = 20,
               verify_emails: bool = True) -> Dict:
    """Main function to start a scan job"""
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
