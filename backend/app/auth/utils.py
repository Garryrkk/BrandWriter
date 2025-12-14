from passlib.context import CryptContext

# Using bcrypt for hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Returns a secure hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Validates a plaintext password against its hashed version.
    """
    return pwd_context.verify(plain_password, hashed_password)
