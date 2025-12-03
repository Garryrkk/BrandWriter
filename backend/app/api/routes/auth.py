from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ----------------------------
# DB Session Dependency
# ----------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ----------------------------
# SIGN UP
# ----------------------------
@router.post("/signup")
def signup(email: str, password: str, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == email).first()

    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User.create(db, email=email, password=password)

    return {"message": "Account created", "user_id": user.id}


# ----------------------------
# LOGIN
# ----------------------------
@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = User.authenticate(db, email=email, password=password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})

    return {"access_token": token, "token_type": "bearer"}


# ----------------------------
# LOGOUT
# (Frontend simply deletes token from storage)
# ----------------------------
@router.post("/logout")
def logout():
    return {"message": "Logout successful — clear token on frontend"}


# ----------------------------
# DELETE ACCOUNT
# ----------------------------
@router.delete("/delete-account")
def delete_account(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # decode token
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.delete(db)

    return {"message": "Account deleted successfully"}
