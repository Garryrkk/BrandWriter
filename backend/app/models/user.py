from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.database import Base
from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"


id = Column(Integer, primary_key=True, index=True)
email = Column(String, unique=True, nullable=False)
hashed_password = Column(String, nullable=False)
created_at = Column(DateTime, default=datetime.utcnow)


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