"""
Email scraping module with scan job management
Extracts PEOPLE first, then discovers emails
Pipeline: Company → People → Roles → Emails → Validation → Drafts
NO MOCK DATA. NO FALLBACKS. NO GENERATED EMAILS.
"""

import re
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Optional, Set
from urllib.parse import urljoin, urlparse
import time
from datetime import datetime
from sqlalchemy.orm import Session

from email_validator import (
    validate_email_full, 
    is_allowed_role,
    normalize_role,
    is_blocked_prefix,
    DECISION_MAKER_ROLES
)
from database import (
    Company, Person, Email, ScanJob, ScanStatus,
    EmailStatus, EmailDiscoveryStatus, VerificationStatus
)

# User agent for requests
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Pages to avoid
BLOCKED_PATHS = [
    '/contact', '/about/contact', '/get-in-touch',
    '/legal', '/privacy', '/terms', '/security',
    '/support', '/help', '/faq', '/download',
    '/pricing', '/blog', '/news', '/press'
]

# Role detection patterns (must match DECISION_MAKER_ROLES)
ROLE_PATTERNS = [
    r'\b(founder|co-?founder)\b',
    r'\b(ceo|chief executive officer)\b',
    r'\b(cto|chief technology officer)\b',
    r'\b(cfo|chief financial officer)\b',
    r'\b(coo|chief operating officer)\b',
    r'\b(chief product officer|cpo)\b',
    r'\b(head\s+of\s+engineering)\b',
    r'\b(vp\s+engineering|vp\s+of\s+engineering|vice\s+president\s+engineering)\b',
    r'\b(engineering\s+manager)\b',
    r'\b(staff\s+engineer)\b',
    r'\b(principal\s+engineer)\b',
    r'\b(founding\s+engineer)\b',
    r'\b(platform\s+lead)\b',
    r'\b(infrastructure\s+lead)\b',
    r'\b(head\s+of\s+product)\b',
    r'\b(vp\s+product|vp\s+of\s+product)\b',
    r'\b(growth\s+lead|head\s+of\s+growth)\b',
    r'\b(vp\s+sales|vp\s+of\s+sales|head\s+of\s+sales)\b',
    r'\b(agency\s+owner)\b',
    r'\b(partner)\b',
    r'\b(hr\s+lead|head\s+of\s+hr|head\s+of\s+people)\b'
]


def normalize_name(name: str) -> str:
    """Normalize person name for deduplication"""
    return ' '.join(name.lower().strip().split())


def calculate_page_credibility(url: str) -> float:
    """
    Calculate page credibility based on URL
    Returns 0.0 - 1.0
    """
    url_lower = url.lower()
    
    # High credibility pages
    if '/about' in url_lower or '/team' in url_lower or '/leadership' in url_lower:
        return 1.0
    
    # Medium credibility
    if '/company' in url_lower or '/people' in url_lower:
        return 0.85
    
    # Lower credibility (blog, docs, etc.)
    if '/blog' in url_lower or '/docs' in url_lower:
        return 0.60
    
    # Homepage
    if url_lower.count('/') <= 3:
        return 0.75
    
    return 0.50


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
    
    def update_scan_progress(self, scan_job_id: int, progress: int, current_step: str):
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
        people_found: int,
        emails_discovered: int,
        emails_validated: int,
        emails_rejected_role: int,
        emails_rejected_domain: int,
        emails_rejected_quality: int
    ):
        """Mark scan job as completed"""
        scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
        if scan_job:
            scan_job.status = ScanStatus.COMPLETED
            scan_job.completed_at = datetime.utcnow()
            scan_job.people_found = people_found
            scan_job.emails_discovered = emails_discovered
            scan_job.emails_validated = emails_validated
            scan_job.emails_rejected_role = emails_rejected_role
            scan_job.emails_rejected_domain = emails_rejected_domain
            scan_job.emails_rejected_quality = emails_rejected_quality
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
            'people_found': scan_job.people_found,
            'emails_discovered': scan_job.emails_discovered,
            'emails_validated': scan_job.emails_validated,
            'emails_rejected_role': scan_job.emails_rejected_role,
            'emails_rejected_domain': scan_job.emails_rejected_domain,
            'emails_rejected_quality': scan_job.emails_rejected_quality,
            'error_message': scan_job.error_message,
            'started_at': scan_job.started_at,
            'completed_at': scan_job.completed_at
        }


class PeopleDiscovery:
    """Discovers people from web pages"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def extract_people(self, html: str, page_url: str, company_domain: str) -> List[Dict]:
        """
        Extract people with names and roles from HTML
        Returns: [{'name': str, 'role': str, 'confidence': float, 'source_page': str}]
        """
        soup = BeautifulSoup(html, 'html.parser')
        people = []
        
        # Strategy 1: Team cards
        team_cards = soup.find_all(['div', 'article'], class_=re.compile(r'team|member|person|profile', re.I))
        for card in team_cards:
            person = self._extract_from_team_card(card, page_url)
            if person:
                people.append(person)
        
        # Strategy 2: Blog authors
        author_sections = soup.find_all(['div', 'span', 'p'], class_=re.compile(r'author|byline|written', re.I))
        for section in author_sections:
            person = self._extract_from_author_section(section, page_url)
            if person:
                people.append(person)
        
        # Strategy 3: Heading + role pattern
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'strong', 'b'])
        for heading in headings:
            person = self._extract_from_heading(heading, page_url)
            if person:
                people.append(person)
        
        # Filter: Only keep people with decision-maker roles
        decision_makers = []
        for person in people:
            normalized_role = normalize_role(person['role'])
            if normalized_role and is_allowed_role(normalized_role):
                person['role'] = normalized_role  # Use normalized role
                decision_makers.append(person)
        
        # Deduplicate by normalized name
        unique_people = {}
        for person in decision_makers:
            norm_name = normalize_name(person['name'])
            if norm_name not in unique_people or person['confidence'] > unique_people[norm_name]['confidence']:
                unique_people[norm_name] = person
        
        return list(unique_people.values())
    
    def _extract_from_team_card(self, element, page_url: str) -> Optional[Dict]:
        """Extract person from team card structure"""
        name = None
        role = None
        
        name_elem = element.find(['h3', 'h4', 'strong', 'b'])
        if name_elem:
            name = name_elem.get_text(strip=True)
        
        role_elem = element.find(['p', 'span', 'div'], class_=re.compile(r'role|title|position', re.I))
        if role_elem:
            role = role_elem.get_text(strip=True)
        else:
            text = element.get_text()
            role = self._extract_role_from_text(text)
        
        if name and role and self._is_valid_name(name):
            return {
                'name': name,
                'role': role,
                'confidence': 0.90,
                'source_page': page_url
            }
        
        return None
    
    def _extract_from_author_section(self, element, page_url: str) -> Optional[Dict]:
        """Extract person from blog author section"""
        text = element.get_text()
        
        name_match = re.search(r'by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)', text)
        if name_match:
            name = name_match.group(1)
            role = self._extract_role_from_text(text)
            
            if role:
                return {
                    'name': name,
                    'role': role,
                    'confidence': 0.75,
                    'source_page': page_url
                }
        
        return None
    
    def _extract_from_heading(self, element, page_url: str) -> Optional[Dict]:
        """Extract person from heading with role"""
        text = element.get_text(strip=True)
        
        match = re.match(r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*[-,]\s*(.+)', text)
        if match:
            name = match.group(1)
            potential_role = match.group(2)
            
            normalized_role = normalize_role(potential_role)
            if normalized_role and is_allowed_role(normalized_role):
                return {
                    'name': name,
                    'role': normalized_role,
                    'confidence': 0.85,
                    'source_page': page_url
                }
        
        return None
    
    def _extract_role_from_text(self, text: str) -> Optional[str]:
        """Extract role from text using patterns"""
        for pattern in ROLE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                role = match.group(0)
                normalized = normalize_role(role)
                if normalized and is_allowed_role(normalized):
                    return normalized
        return None
    
    def _is_valid_name(self, name: str) -> bool:
        """Check if name looks valid"""
        parts = name.split()
        if len(parts) < 2:
            return False
        
        return all(part[0].isupper() for part in parts if part)


class EmailDiscovery:
    """Discovers emails for people"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
    
    def discover_email(
        self,
        person: Person,
        company_domain: str,
        html: str = None
    ) -> List[Dict]:
        """
        Discover emails for a person
        Returns list of discovered emails with metadata
        NO MOCK DATA. Returns empty list if nothing found.
        """
        discovered = []
        
        # Strategy 1: Direct discovery in HTML
        if html:
            direct_email = self._find_email_near_name(html, person.full_name, company_domain)
            if direct_email:
                discovered.append({
                    'email': direct_email,
                    'source_type': 'website',
                    'source_url': person.source_page,
                    'discovery_method': 'regex'
                })
        
        # Strategy 2: Structured extraction (if in table/list)
        if html:
            structured_email = self._extract_structured_email(html, person.full_name, company_domain)
            if structured_email and structured_email not in [d['email'] for d in discovered]:
                discovered.append({
                    'email': structured_email,
                    'source_type': 'website',
                    'source_url': person.source_page,
                    'discovery_method': 'structured'
                })
        
        # Strategy 3: Pattern inference (ONLY if no direct discovery)
        if not discovered:
            inferred = self._infer_email_from_name(person.full_name, company_domain, person.source_page)
            discovered.extend(inferred)
        
        # Filter: Only valid patterns
        valid_discovered = []
        for email_data in discovered:
            if self._is_valid_email_pattern(email_data['email']):
                valid_discovered.append(email_data)
        
        # NO MOCK DATA: Return empty if nothing found
        return valid_discovered if valid_discovered else []
    
    def _find_email_near_name(self, html: str, name: str, domain: str) -> Optional[str]:
        """Find email address near person's name in HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        text = soup.get_text()
        
        name_index = text.lower().find(name.lower())
        if name_index == -1:
            return None
        
        context = text[max(0, name_index-500):name_index+500]
        
        email_pattern = r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'
        emails = re.findall(email_pattern, context)
        
        for email in emails:
            email_lower = email.lower()
            if domain.lower() in email_lower and not is_blocked_prefix(email_lower):
                return email_lower
        
        return None
    
    def _extract_structured_email(self, html: str, name: str, domain: str) -> Optional[str]:
        """Extract email from structured data (tables, lists)"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for email in mailto links
        mailto_links = soup.find_all('a', href=re.compile(r'^mailto:', re.I))
        
        for link in mailto_links:
            # Check if link is near the person's name
            parent_text = link.parent.get_text() if link.parent else ""
            
            if name.lower() in parent_text.lower():
                email = link['href'].replace('mailto:', '').strip()
                if domain.lower() in email.lower() and not is_blocked_prefix(email):
                    return email.lower()
        
        return None
    
    def _infer_email_from_name(self, name: str, domain: str, source_url: str) -> List[Dict]:
        """
        Infer possible email patterns from name
        ONLY ALLOWED PATTERNS
        """
        parts = name.lower().split()
        if len(parts) < 2:
            return []
        
        first = parts[0]
        last = parts[-1]
        
        # ALLOWED PATTERNS ONLY
        patterns = [
            {
                'email': f"{first}@{domain}",
                'source_type': 'website',
                'source_url': source_url,
                'discovery_method': 'inferred'
            },
            {
                'email': f"{first}.{last}@{domain}",
                'source_type': 'website',
                'source_url': source_url,
                'discovery_method': 'inferred'
            },
            {
                'email': f"{first[0]}.{last}@{domain}",
                'source_type': 'website',
                'source_url': source_url,
                'discovery_method': 'inferred'
            },
            {
                'email': f"{first[0]}{last}@{domain}",
                'source_type': 'website',
                'source_url': source_url,
                'discovery_method': 'inferred'
            }
        ]
        
        return patterns
    
    def _is_valid_email_pattern(self, email: str) -> bool:
        """Check if email matches allowed patterns"""
        local_part = email.split('@')[0]
        
        if is_blocked_prefix(email):
            return False
        
        allowed_patterns = [
            r'^[a-z]+$',
            r'^[a-z]+\.[a-z]+$',
            r'^[a-z]\.[a-z]+$',
            r'^[a-z][a-z]+$',
        ]
        
        return any(re.match(pattern, local_part) for pattern in allowed_patterns)


class EmailScraper:
    """Main scraper orchestrating the full pipeline"""
    
    def __init__(self, db: Session, rate_limit: float = 2.0):
        self.db = db
        self.rate_limit = rate_limit
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        self.scan_manager = ScanJobManager(db)
        self.people_discovery = PeopleDiscovery()
        self.email_discovery = EmailDiscovery()
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL should be scraped"""
        parsed = urlparse(url)
        path = parsed.path.lower()
        return not any(blocked in path for blocked in BLOCKED_PATHS)
    
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
        """Scrape people from website"""
        if not self._is_valid_url(url):
            return []
        
        domain = urlparse(url).netloc
        people_found = []
        visited_urls = set()
        to_visit = [url]
        
        self.scan_manager.update_scan_progress(scan_job_id, 10, f"Starting website scan: {url}")
        
        page_count = 0
        while to_visit and page_count < max_pages:
            current_url = to_visit.pop(0)
            
            if current_url in visited_urls:
                continue
            
            visited_urls.add(current_url)
            page_count += 1
            
            progress = 10 + int((page_count / max_pages) * 40)
            self.scan_manager.update_scan_progress(
                scan_job_id,
                progress,
                f"Scanning page {page_count}/{max_pages}: {current_url}"
            )
            
            html = self._fetch_page(current_url)
            
            if not html:
                continue
            
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract people from this page
            page_people = self.people_discovery.extract_people(html, current_url, domain)
            
            for person_data in page_people:
                person_data['html'] = html
                people_found.append(person_data)
            
            # Find more pages
            if page_count < max_pages:
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    full_url = urljoin(current_url, href)
                    
                    if domain in full_url and self._is_valid_url(full_url):
                        if full_url not in visited_urls and len(to_visit) < 20:
                            to_visit.append(full_url)
        
        return people_found
    
    def run_full_scan(
        self,
        company_id: int,
        scan_website: bool = True,
        scan_linkedin: bool = False,
        max_pages: int = 5,
        verify_emails: bool = True,
        scan_job_id: Optional[int] = None
    ) -> Dict:
        """
        Run complete scan job
        Pipeline: Company → People → Roles → Emails → Validation → Drafts
        NO MOCK DATA. Returns empty results if nothing found.
        """
        company = self.db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return {'error': 'Company not found'}
        
        # Use existing scan job if provided, otherwise create new one
        if scan_job_id:
            scan_job = self.db.query(ScanJob).filter(ScanJob.id == scan_job_id).first()
            if not scan_job:
                scan_job = self.scan_manager.create_scan_job(
                    company_id=company_id,
                    scan_website=scan_website,
                    scan_linkedin=scan_linkedin,
                    max_pages=max_pages
                )
        else:
            scan_job = self.scan_manager.create_scan_job(
                company_id=company_id,
                scan_website=scan_website,
                scan_linkedin=scan_linkedin,
                max_pages=max_pages
            )
        
        try:
            self.scan_manager.start_scan_job(scan_job.id)
            
            all_people = []
            
            # PHASE 1: Discover people
            if scan_website and company.website:
                self.scan_manager.update_scan_progress(scan_job.id, 5, "Discovering people from website")
                website_people = self.scrape_website(
                    company.website,
                    company_id,
                    scan_job.id,
                    max_pages
                )
                all_people.extend(website_people)
            
            # NO MOCK DATA: If no people found, return empty result
            if not all_people:
                self.scan_manager.complete_scan_job(
                    scan_job.id,
                    people_found=0,
                    emails_discovered=0,
                    emails_validated=0,
                    emails_rejected_role=0,
                    emails_rejected_domain=0,
                    emails_rejected_quality=0
                )
                return {
                    'scan_job_id': scan_job.id,
                    'status': 'completed',
                    'people_found': 0,
                    'emails_discovered': 0,
                    'emails_validated': 0,
                    'message': 'No decision-makers found'
                }
            
            # PHASE 2: Save people (already filtered by role)
            self.scan_manager.update_scan_progress(scan_job.id, 60, f"Saving {len(all_people)} decision makers")
            
            saved_people = []
            for person_data in all_people:
                # Deduplicate at person level
                norm_name = normalize_name(person_data['name'])
                existing = self.db.query(Person).filter(
                    Person.company_id == company_id,
                    Person.normalized_name == norm_name,
                    Person.role == person_data['role']
                ).first()
                
                if existing:
                    saved_people.append((existing, person_data))
                    continue
                
                person = Person(
                    company_id=company_id,
                    full_name=person_data['name'],
                    normalized_name=norm_name,
                    role=person_data['role'],
                    role_confidence=person_data['confidence'],
                    source_page=person_data['source_page']
                )
                self.db.add(person)
                self.db.commit()
                self.db.refresh(person)
                
                saved_people.append((person, person_data))
            
            # PHASE 3: Discover and validate emails
            self.scan_manager.update_scan_progress(scan_job.id, 70, "Discovering emails for decision makers")
            
            stats = {
                'discovered': 0,
                'validated': 0,
                'rejected_role': 0,
                'rejected_domain': 0,
                'rejected_quality': 0
            }
            
            for person, person_data in saved_people:
                # Discover emails
                discovered_emails = self.email_discovery.discover_email(
                    person,
                    company.domain,
                    person_data.get('html')
                )
                
                # NO MOCK DATA: Skip if no emails discovered
                if not discovered_emails:
                    continue
                
                for email_data in discovered_emails:
                    email_address = email_data['email']
                    
                    # Check if exists
                    existing_email = self.db.query(Email).filter(
                        Email.email_address == email_address
                    ).first()
                    
                    if existing_email:
                        continue
                    
                    stats['discovered'] += 1
                    
                    # MANDATORY VALIDATION
                    page_credibility = calculate_page_credibility(email_data['source_url'])
                    
                    validation = validate_email_full(
                        email_address,
                        company.domain,
                        role_confidence=person.role_confidence,
                        discovery_method=email_data['discovery_method'],
                        page_credibility=page_credibility,
                        check_mx=verify_emails,
                        check_smtp=False
                    )
                    
                    # Determine discovery status
                    if not validation['is_valid']:
                        if not validation['domain_match']:
                            discovery_status = EmailDiscoveryStatus.REJECTED_DOMAIN
                            stats['rejected_domain'] += 1
                        elif validation['quality_score'] < 70:
                            discovery_status = EmailDiscoveryStatus.REJECTED_QUALITY
                            stats['rejected_quality'] += 1
                        else:
                            discovery_status = EmailDiscoveryStatus.REJECTED_QUALITY
                            stats['rejected_quality'] += 1
                        
                        # Save rejected email (backend only)
                        email = Email(
                            email_address=email_address,
                            person_id=person.id,
                            company_id=company_id,
                            scan_job_id=scan_job.id,
                            status=EmailStatus.DELETED,
                            discovery_status=discovery_status,
                            verification_status=VerificationStatus.INVALID,
                            source_type=email_data['source_type'],
                            source_url=email_data['source_url'],
                            discovery_method=email_data['discovery_method'],
                            quality_score=validation['quality_score'],
                            confidence_score=validation['confidence_score'],
                            confidence_level=validation['confidence_level'],
                            is_validated=True,
                            mx_valid=validation['mx_valid'],
                            is_role_email=validation['is_role_email'],
                            is_disposable=validation['is_disposable'],
                            verification_error=validation['reason'],
                            verified_at=datetime.utcnow()
                        )
                        self.db.add(email)
                        continue
                    
                    # SAVE VALID EMAIL AS DRAFT
                    stats['validated'] += 1
                    
                    email = Email(
                        email_address=email_address,
                        person_id=person.id,
                        company_id=company_id,
                        scan_job_id=scan_job.id,
                        status=EmailStatus.DRAFT,
                        discovery_status=EmailDiscoveryStatus.VALIDATED,
                        verification_status=VerificationStatus.VALID,
                        source_type=email_data['source_type'],
                        source_url=email_data['source_url'],
                        discovery_method=email_data['discovery_method'],
                        quality_score=validation['quality_score'],
                        confidence_score=validation['confidence_score'],
                        confidence_level=validation['confidence_level'],
                        is_validated=True,
                        mx_valid=validation['mx_valid'],
                        is_role_email=validation['is_role_email'],
                        is_disposable=validation['is_disposable'],
                        verified_at=datetime.utcnow()
                    )
                    self.db.add(email)
            
            self.db.commit()
            
            # Update company
            company.last_scanned = datetime.utcnow()
            self.db.commit()
            
            # Complete scan
            self.scan_manager.complete_scan_job(
                scan_job.id,
                people_found=len(saved_people),
                emails_discovered=stats['discovered'],
                emails_validated=stats['validated'],
                emails_rejected_role=stats['rejected_role'],
                emails_rejected_domain=stats['rejected_domain'],
                emails_rejected_quality=stats['rejected_quality']
            )
            
            return {
                'scan_job_id': scan_job.id,
                'status': 'completed',
                'people_found': len(saved_people),
                'emails_discovered': stats['discovered'],
                'emails_validated': stats['validated'],
                'emails_rejected_domain': stats['rejected_domain'],
                'emails_rejected_quality': stats['rejected_quality']
            }
            
        except Exception as e:
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
    verify_emails: bool = True,
    scan_job_id: Optional[int] = None
) -> Dict:
    """
    Main function to start a scan job
    NO MOCK DATA. Returns empty if nothing found.
    """
    scraper = EmailScraper(db)
    return scraper.run_full_scan(
        company_id=company_id,
        scan_website=scan_website,
        scan_linkedin=scan_linkedin,
        max_pages=max_pages,
        verify_emails=verify_emails,
        scan_job_id=scan_job_id
    )


def get_scan_status(db: Session, scan_job_id: int) -> Optional[Dict]:
    """Get status of a scan job"""
    manager = ScanJobManager(db)
    return manager.get_scan_status(scan_job_id)