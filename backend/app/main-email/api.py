from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from scraper import EmailScraper
from email_validator import EmailValidator
from email_sender import EmailSender
from database import Database
import logging
import threading
import time


class LeadScorer:
    """Score and filter leads to target small product startups."""

    def __init__(self):
        self.reject_role_tokens = [
            'marketing', 'growth', 'sales', 'partnership', 'hr', 'recruiter', 'community',
            'coach', 'consultant', 'agency', 'evangelist'
        ]
        self.engineering_tokens = ['engineer', 'eng', 'dev', 'developer', 'platform', 'infra']
        self.head_tokens = ['head', 'vp', 'lead', 'principal', 'staff']

    def build_mix_targets(self, total):
        targets = {
            'founder': max(1, int(total * 0.35)),
            'cto': max(1, int(total * 0.25)),
            'engineer': max(1, int(total * 0.2)),
            'head': max(1, int(total * 0.05)),
        }
        while sum(targets.values()) > total and targets['head'] > 0:
            targets['head'] -= 1
        return targets

    def classify_role(self, email: str, signals: dict) -> Optional[str]:
        local = email.split('@')[0].lower()
        if any(tok in local for tok in self.reject_role_tokens):
            return 'rejected'
        if 'founder' in local or 'cofounder' in local or 'co-founder' in local:
            return 'founder'
        if 'cto' in local or 'chieftechnologyofficer' in local.replace('.', ''):
            return 'cto'

        text_hits = signals.get('title_hits', set()) if signals else set()
        if any('founder' in t for t in text_hits):
            return 'founder'
        if any('cto' in t for t in text_hits):
            return 'cto'
        if any(tok in local for tok in self.head_tokens) or any('head of engineering' in t or 'vp engineering' in t for t in text_hits):
            return 'head'
        if any(tok in local for tok in self.engineering_tokens) or any('engineer' in t for t in text_hits):
            return 'engineer'

        return None

    def score(self, email: str, signals: dict, role: Optional[str]) -> int:
        score = 0
        if role == 'founder':
            score += 40
        elif role == 'cto':
            score += 40
        elif role in ['head']:
            score += 10
        elif role == 'engineer':
            score += 30

        if signals.get('has_product_keywords'):
            score += 10
        if signals.get('has_agency_keywords'):
            score -= 50

        local = email.split('@')[0].lower()
        if any(tok in local for tok in self.reject_role_tokens):
            score -= 30

        return score

    def within_mix(self, role: Optional[str], counts: dict, targets: dict) -> bool:
        if role not in targets:
            return False
        return counts.get(role, 0) < targets[role]

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = Database()
scraper = EmailScraper()
validator = EmailValidator()
scorer = LeadScorer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Track scanning status
scan_status = {
    'is_scanning': False,
    'progress': 0,
    'total': 0
}

# Pydantic models
class ScanRequest(BaseModel):
    interests: List[str] = []
    target_count: int = 100

class CampaignRequest(BaseModel):
    subject: str = 'Hello'
    body: str
    limit: int = 50
    gmail: str
    app_password: str

class SendEmailRequest(BaseModel):
    recipient_email: str
    gmail_email: str
    gmail_password: str
    subject: str = 'Hello from BrandWriter'
    body: str

@app.get('/api/health')
async def health_check():
    """Check if API is running"""
    return {'status': 'ok'}

@app.get('/api/stats')
async def get_stats():
    """Get database statistics"""
    try:
        stats = db.get_stats()
        return stats
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/emails')
async def get_emails():
    """Get all collected emails"""
    try:
        emails = db.get_all_emails()
        return emails
    except Exception as e:
        logger.error(f"Get emails error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete('/api/emails/{email_id}')
async def delete_email(email_id: int):
    """Delete an email"""
    try:
        db.delete_email(email_id)
        return {'status': 'deleted'}
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/verify-email/{email_id}')
async def verify_email(email_id: int):
    """Manually verify an email"""
    try:
        email_data = db.get_email_by_id(email_id)
        if not email_data:
            raise HTTPException(status_code=404, detail='Email not found')
        
        is_valid, message = validator.validate(email_data['email'])
        
        if is_valid:
            db.mark_as_verified(email_data['email'])
        
        return {
            'is_valid': is_valid,
            'message': message
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verify error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/start-scan')
async def start_scan(data: ScanRequest):
    """Start email collection scan"""
    global scan_status
    
    if scan_status['is_scanning']:
        raise HTTPException(status_code=400, detail='Scan already in progress')
    
    interests = data.interests
    target_count = data.target_count
    
    def scan_job():
        global scan_status
        try:
            scan_status['is_scanning'] = True
            scan_status['progress'] = 0
            scan_status['total'] = target_count
            counters = {
                'pages_scanned': 0,
                'emails_extracted': 0,
                'emails_filtered': 0,
                'emails_scored': 0,
                'emails_collected': 0,
            }

            collected = 0
            role_counts = {'founder': 0, 'cto': 0, 'engineer': 0, 'head': 0}
            mix_targets = scorer.build_mix_targets(target_count)
            print(f"[SCAN] Starting scan for interests: {interests}")
            logger.info(f"Starting scan for {interests}")

            for interest in interests:
                if collected >= target_count:
                    break

                try:
                    # Use site-finding queries (product-first)
                    query = f"{interest} saas startup site pricing"
                    print(f"[SCAN] Searching for: {query}")
                    logger.info(f"Searching for: {query}")

                    urls = scraper.search_google(query, num_results=60)

                    big_company_domains = [
                        'microsoft', 'google', 'facebook', 'meta', 'amazon', 'apple',
                        'oracle', 'salesforce', 'adobe', 'ibm', 'sap', 'cisco',
                        'stripe', 'shopify', 'mailchimp', 'hubspot', 'zendesk',
                        'atlassian', 'slack', 'notion', 'figma', 'canva', 'asana',
                        'twilio', 'cloudflare', 'digitalocean', 'heroku', 'netlify'
                    ]

                    filtered_urls = []
                    curated_cap = max(1, target_count // 7)  # limit curated to ~15%
                    curated_used = 0
                    for url in urls:
                        url_lower = url.lower()
                        if any(big_domain in url_lower for big_domain in big_company_domains):
                            continue
                        # limit curated sources
                        if 'cal.com' in url_lower or 'supabase.com' in url_lower or 'modal.com' in url_lower:
                            if curated_used >= curated_cap:
                                continue
                            curated_used += 1
                        filtered_urls.append(url)

                    print(f"[SCAN] Found {len(filtered_urls)} URLs after filtering")
                    logger.info(f"Found {len(filtered_urls)} URLs to scrape (filtered from {len(urls)})")

                    urls = filtered_urls

                    for url in urls:
                        if collected >= target_count:
                            break

                        try:
                            contact_urls = scraper.find_contact_pages(url)

                            for contact_url in contact_urls:
                                if collected >= target_count:
                                    break
                                counters['pages_scanned'] += 1
                                scrape_result = scraper.scrape_website(contact_url)
                                signals = scrape_result.get('signals', {}) if isinstance(scrape_result, dict) else {}

                                raw_emails = []
                                if isinstance(scrape_result, dict):
                                    raw_emails = scrape_result.get('raw_emails', []) or scrape_result.get('emails', []) or []
                                    emails = scrape_result.get('emails', []) or []
                                else:
                                    raw_emails = scrape_result
                                    emails = scrape_result

                                raw_emails = list(dict.fromkeys(raw_emails))
                                counters['emails_extracted'] += len(raw_emails)

                                # Assertion: extraction should always be attempted
                                assert counters['pages_scanned'] > 0, "pages_scanned should be positive"
                                
                                if counters['pages_scanned'] > 0 and counters['emails_extracted'] == 0:
                                    logger.debug(f"Zero extraction on page #{counters['pages_scanned']}: {contact_url}")

                                print(f"[SCAN] Extracted {len(raw_emails)} raw emails from {contact_url}")
                                logger.info(f"[EXTRACT] {len(raw_emails)} raw emails from {contact_url}")

                                for raw_email in raw_emails:
                                    email = raw_email.strip().lower()

                                    # Store raw immediately (non-blocking validation)
                                    try:
                                        db.add_raw_email({
                                            'email': email,
                                            'source_url': contact_url,
                                            'interests': [interest],
                                        })
                                    except Exception as db_err:
                                        logger.debug(f"Raw email store issue: {db_err}")

                                    is_valid, reason = validator.validate(
                                        email,
                                        strict=False,
                                        require_personal=False,
                                        allow_role_based=True,
                                    )

                                    if not is_valid and 'format' in reason.lower():
                                        counters['emails_filtered'] += 1
                                        logger.debug(f"[FILTER] Rejected {email}: {reason}")
                                        continue

                                    role = scorer.classify_role(email, signals)
                                    lead_score = scorer.score(email, signals, role)
                                    counters['emails_scored'] += 1

                                    # Post-extraction agency detection (only affects scoring, not extraction)
                                    if signals.get('agency_hits', 0) >= 2:
                                        counters['emails_filtered'] += 1
                                        logger.debug(f"[FILTER] {email} from agency/enterprise site (hits={signals.get('agency_hits')})")
                                        continue

                                    if role == 'rejected':
                                        counters['emails_filtered'] += 1
                                        continue

                                    if lead_score < 10:
                                        db.add_low_score_email({
                                            'email': email,
                                            'source_url': contact_url,
                                            'interests': [interest],
                                            'score': lead_score,
                                            'role': role,
                                            'is_valid': is_valid,
                                        })
                                        counters['emails_filtered'] += 1
                                        continue

                                    if role and not scorer.within_mix(role, role_counts, mix_targets):
                                        counters['emails_filtered'] += 1
                                        continue

                                    email_data = {
                                        'email': email,
                                        'source_url': contact_url,
                                        'interests': [interest],
                                        'is_verified': is_valid,
                                    }

                                    if db.add_email(email_data):
                                        collected += 1
                                        counters['emails_collected'] += 1
                                        if role:
                                            role_counts[role] = role_counts.get(role, 0) + 1
                                        scan_status['progress'] = collected
                                        print(f"[COLLECT] ✓ {email} ({collected}/{target_count}) role={role} score={lead_score}")
                                        logger.info(f"[COLLECT] Accepted: {email} ({collected}/{target_count}) role={role} score={lead_score}")
                                    else:
                                        counters['emails_filtered'] += 1

                                time.sleep(1)

                        except Exception as e:
                            logger.error(f"Error scraping {url}: {e}")
                            print(f"[SCAN ERROR] Scraping {url}: {e}")
                            continue

                except Exception as e:
                    logger.error(f"Error with interest '{interest}': {e}")
                    print(f"[SCAN ERROR] Interest '{interest}': {e}")
                    continue

            if counters['pages_scanned'] > 0 and counters['emails_extracted'] == 0:
                print("[SCAN WARNING] No emails extracted despite pages scanned. Treat as bug.")
                logger.warning("No emails extracted despite pages scanned. Treat as bug.")

            scan_status['is_scanning'] = False
            print(f"[SCAN] Complete! Collected {collected} emails")
            logger.info(
                f"Scan complete! Counters: pages_scanned={counters['pages_scanned']}, "
                f"emails_extracted={counters['emails_extracted']}, "
                f"emails_filtered={counters['emails_filtered']}, "
                f"emails_scored={counters['emails_scored']}, "
                f"emails_collected={counters['emails_collected']}"
            )

        except Exception as e:
            scan_status['is_scanning'] = False
            print(f"[SCAN FATAL ERROR] {e}")
            logger.error(f"Scan fatal error: {e}")
            import traceback
            traceback.print_exc()
    
    # Start scan in background thread
    thread = threading.Thread(target=scan_job)
    thread.daemon = True
    thread.start()
    
    return {
        'status': 'scanning_started',
        'target': target_count
    }

@app.get('/api/scan-status')
async def get_scan_status():
    """Get current scan status"""
    return scan_status

@app.post('/api/send-email')
async def send_email(data: SendEmailRequest):
    """Send a single test email"""
    recipient = data.recipient_email
    gmail = data.gmail_email
    app_password = data.gmail_password
    subject = data.subject
    body = data.body
    
    if not gmail or not app_password:
        raise HTTPException(status_code=400, detail='Gmail credentials required')
    
    if not recipient:
        raise HTTPException(status_code=400, detail='Recipient email required')
    
    if not body:
        raise HTTPException(status_code=400, detail='Email body required')
    
    try:
        sender = EmailSender(gmail, app_password)
        
        # Send the test email
        success = sender.send_email(recipient, subject, body)
        
        if success:
            logger.info(f"Test email sent to {recipient}")
            return {'success': True, 'message': f'Email sent successfully to {recipient}'}
        else:
            logger.warning(f"Failed to send email to {recipient}")
            raise HTTPException(status_code=500, detail=f'Failed to send email to {recipient}')
    
    except Exception as e:
        logger.error(f"Send email error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/api/send-campaign')
async def send_campaign(data: CampaignRequest):
    """Start email campaign"""
    subject = data.subject
    body = data.body
    limit = data.limit
    gmail = data.gmail
    app_password = data.app_password
    
    if not gmail or not app_password:
        raise HTTPException(status_code=400, detail='Gmail credentials required')
    
    if not body:
        raise HTTPException(status_code=400, detail='Email body required')
    
    def send_job():
        try:
            sender = EmailSender(gmail, app_password)
            emails = db.get_unsent_emails(limit)
            
            logger.info(f"Starting campaign to {len(emails)} recipients")
            
            sent_count = 0
            for email_row in emails:
                email_dict = {
                    'email': email_row[1],
                    'name': email_row[2] or 'there',
                    'company': email_row[3] or 'your company',
                    'interest': 'your field'
                }
                
                if sender.send_email(email_dict['email'], subject, body, email_dict):
                    db.mark_as_sent(email_dict['email'])
                    sent_count += 1
                    logger.info(f"Sent {sent_count}/{len(emails)}")
                
                time.sleep(2)  # Rate limiting
            
            logger.info(f"Campaign complete! Sent {sent_count} emails")
        
        except Exception as e:
            logger.error(f"Campaign error: {e}")
    
    thread = threading.Thread(target=send_job)
    thread.daemon = True
    thread.start()
    
    return {'status': 'campaign_started'}

if __name__ == '__main__':
    import uvicorn
    logger.info("🚀 Starting Email Outreach API Server")
    logger.info("📍 API available at http://localhost:5000")
    uvicorn.run(app, host='0.0.0.0', port=5000)