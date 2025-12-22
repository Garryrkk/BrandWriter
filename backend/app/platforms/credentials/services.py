from cryptography.fernet import Fernet
from app.core.config import settings
import os

# Get encryption key from settings or environment
ENCRYPTION_KEY = getattr(settings, 'ENCRYPTION_KEY', None) or os.getenv('ENCRYPTION_KEY')

if ENCRYPTION_KEY:
    cipher = Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)
else:
    # Generate a key for development (should be set in production)
    cipher = None


def encrypt_token(token: str) -> str:
    """Encrypt a token for secure storage"""
    if not cipher:
        raise ValueError("ENCRYPTION_KEY not configured. Set it in environment variables.")
    return cipher.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt a stored token"""
    if not cipher:
        raise ValueError("ENCRYPTION_KEY not configured. Set it in environment variables.")
    return cipher.decrypt(encrypted_token.encode()).decode()


def generate_encryption_key() -> str:
    """Generate a new Fernet encryption key (use once for setup)"""
    return Fernet.generate_key().decode()
