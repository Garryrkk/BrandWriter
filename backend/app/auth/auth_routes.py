from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from app.db.database import get_db
from app.models.user import User
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class RegisterSchema(BaseModel):
    email: str
    password: str

class LoginSchema(BaseModel):
    email: str
    password: str


# ----------------------------
# REGISTER / SIGN UP
# ----------------------------
@router.post("/register")
def register_user(data: RegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered", "user_id": new_user.id}


@router.post("/signup")
def signup(data: RegisterSchema, db: Session = Depends(get_db)):
    """Alias for register endpoint"""
    return register_user(data, db)


# ----------------------------
# LOGIN
# ----------------------------
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
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

    db.delete(user)
    db.commit()

    return {"message": "Account deleted successfully"}


# ----------------------------
# GET CURRENT USER
# ----------------------------
@router.get("/me")
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"id": user.id, "email": user.email}
