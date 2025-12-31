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
            
            collected = 0
            print(f"[SCAN] Starting scan for interests: {interests}")
            logger.info(f"Starting scan for {interests}")
            
            for interest in interests:
                if collected >= target_count:
                    break
                
                try:
                    # Search for relevant websites
                    query = f"{interest} contact email"
                    print(f"[SCAN] Searching for: {query}")
                    logger.info(f"Searching for: {query}")
                    
                    urls = scraper.search_google(query, num_results=30)
                    print(f"[SCAN] Found {len(urls)} URLs to scrape")
                    logger.info(f"Found {len(urls)} URLs to scrape")
                    
                    for url in urls:
                        if collected >= target_count:
                            break
                        
                        try:
                            # Find contact pages
                            contact_urls = scraper.find_contact_pages(url)
                            
                            for contact_url in contact_urls[:3]:  # Limit to 3 pages per site
                                if collected >= target_count:
                                    break
                                
                                # Scrape emails
                                emails = scraper.scrape_website(contact_url)
                                print(f"[SCAN] Found {len(emails)} emails on {contact_url}")
                                logger.info(f"Found {len(emails)} emails on {contact_url}")
                                
                                for email in emails:
                                    if collected >= target_count:
                                        break
                                    
                                    # Validate email
                                    is_valid, reason = validator.validate(email)
                                    
                                    if is_valid:
                                        email_data = {
                                            'email': email,
                                            'source_url': contact_url,
                                            'interests': [interest],
                                            'is_verified': True
                                        }
                                        
                                        if db.add_email(email_data):
                                            collected += 1
                                            scan_status['progress'] = collected
                                            print(f"[SCAN] ✓ Collected: {email} ({collected}/{target_count})")
                                            logger.info(f"✓ Collected: {email} ({collected}/{target_count})")
                                    else:
                                        logger.debug(f"✗ Invalid: {email} - {reason}")
                                
                                time.sleep(1)  # Rate limiting
                        
                        except Exception as e:
                            logger.error(f"Error scraping {url}: {e}")
                            print(f"[SCAN ERROR] Scraping {url}: {e}")
                            continue
                    
                except Exception as e:
                    logger.error(f"Error with interest '{interest}': {e}")
                    print(f"[SCAN ERROR] Interest '{interest}': {e}")
                    continue
            
            scan_status['is_scanning'] = False
            print(f"[SCAN] Complete! Collected {collected} emails")
            logger.info(f"Scan complete! Collected {collected} emails")
            
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