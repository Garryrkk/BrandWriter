from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base
from passlib.context import CryptContext
from sqlalchemy.dialects.postgresql import UUID
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")



class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


# ---------- USER ACCOUNT OPERATIONS ----------


def set_password(self, password: str):
    self.hashed_password = pwd_context.hash(password)


def verify_password(self, password: str) -> bool:
    return pwd_context.verify(password, self.hashed_password)


@staticmethod
def create(db, email: str, password: str):
    user = User(email=email)
    user.set_password(password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@staticmethod
def authenticate(db, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if user and user.verify_password(password):
        return user
    return None


def delete_account(self, db):
    db.delete(self)
    db.commit()