"""Debug script to test email scraping and validation"""
import sys
sys.path.insert(0, 'backend/app/main-email')

from database import SessionLocal, Company
from scraper import EmailScraper
from email_validation import validate_email_full

db = SessionLocal()
scraper = EmailScraper(db)

# Try scraping Basecamp
company = db.query(Company).filter(Company.id == 1).first()
print(f'Scraping: {company.name} ({company.website})')

# Get emails from website
emails = scraper.scrape_website(company.website, company.domain, None, max_pages=5)
print(f'\nFound {len(emails)} emails:')

for e in emails:
    email = e['email']
    result = validate_email_full(email, check_mx=True)
    status = "✓ VALID" if result['is_valid'] else "✗ INVALID"
    print(f"  {email}: {status}")
    print(f"    Reason: {result['reason']}")
    print(f"    MX Valid: {result['mx_valid']}")
    print(f"    Quality: {result['quality_score']}")

db.close()
