from app.db.database import SessionLocal
from app.models.email import Email

db = SessionLocal()

test_emails = [
    "yourname@gmail.com",
    "cofounder@gmail.com"
]

for e in test_emails:
    exists = db.query(Email).filter(Email.email == e).first()
    if not exists:
        db.add(Email(
            email=e,
            source="manual_test",
            domain=e.split("@")[1]
        ))

db.commit()
db.close()

print("Test emails added")