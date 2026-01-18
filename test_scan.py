"""Test the scan directly to debug email generation"""
import sys
import os
os.chdir(r'C:\Users\Crazy\Documents\CODES\BrandWriter-main')
sys.path.insert(0, r'C:\Users\Crazy\Documents\CODES\BrandWriter-main\backend\app\main-email')

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from models import Base, Company, Email
from scraper import EmailScraper

# Connect to database
engine = create_engine('sqlite:///emails.db')
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

# Get a company
company = db.query(Company).filter(Company.id == 1).first()
print(f"Testing scan for: {company.name} ({company.domain})")

# Create scraper and run
scraper = EmailScraper(db)

# Count emails before
before_count = db.query(Email).filter(Email.company_id == company.id).count()
print(f"Emails before scan: {before_count}")

# Run scan
result = scraper.run_full_scan(
    company_id=company.id,
    scan_website=True,
    max_pages=5,
    verify_emails=False  # Skip MX validation for speed
)

print(f"\nScan result: {result}")

# Count emails after
after_count = db.query(Email).filter(Email.company_id == company.id).count()
print(f"Emails after scan: {after_count}")

# Total emails in DB
total = db.query(Email).count()
print(f"Total emails in database: {total}")

db.close()
