from app.db.database import SessionLocal
from app.models.source import Source
from app.models.email import Email
from app.services.collector import collect_from_website
from app.services.validator import is_valid

def collect_emails_job():
    db = SessionLocal()

    sources = db.query(Source).filter(Source.active == True).all()

    for source in sources:
        emails = collect_from_website(source.url)

        for email in emails:
            if not is_valid(email):
                continue

            exists = db.query(Email).filter(Email.email == email).first()
            if exists:
                continue

            db.add(Email(
                email=email,
                source="website",
                domain=email.split("@")[1]
            ))

    db.commit()
    db.close()


def collect_voyage_emails_job():
    """Collect emails from voyage API"""
    from app.services.voyage import fetch_emails_from_voyage
    
    db = SessionLocal()
    
    try:
        sources = db.query(Source).filter(Source.active == True).all()
        
        for source in sources:
            voyage_emails = fetch_emails_from_voyage(source.url.replace("https://", ""))
            
            for email in voyage_emails:
                if is_valid(email):
                    exists = db.query(Email).filter(Email.email == email).first()
                    if not exists:
                        db.add(Email(
                            email=email,
                            source="voyage",
                            domain=email.split("@")[1]
                        ))
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Voyage email collection failed: {e}")
    finally:
        db.close()