import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:aurin123@localhost:5432/hooklibrary")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "brandwriter")
    
    # Security
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # AI/ML
    VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
    VOYAGE_MODEL = "voyage-large-3"
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
    HF_TOKEN = os.getenv("HF_TOKEN")
    LOCAL_LLM_PATH = os.getenv("LOCAL_LLM_PATH")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # Email/SendGrid Configuration
    SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")
    FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "genjecx@gmail.com")
    SUBJECT = os.getenv("EMAIL_SUBJECT", "Your Daily Content from BrandWriter")
    BODY = os.getenv("EMAIL_BODY", "<h1>Your Daily Content</h1><p>Check out your fresh content!</p>")
    
    # SMTP Configuration (Gmail)
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # LinkedIn OAuth
    LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID", "")
    LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET", "")
    LINKEDIN_REDIRECT_URI = os.getenv("LINKEDIN_REDIRECT_URI", "http://localhost:3000/api/linkedin/callback")

    # Encryption key for platform credentials (generate with: Fernet.generate_key())
    ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
    
    # Insta-App microservice URL
    INSTA_APP_URL = os.getenv("INSTA_APP_URL", "http://localhost:8001")

    # Scheduler settings
    SCHEDULER_TIMEZONE = "Asia/Kolkata"
    AUTO_POST_CHECK_INTERVAL = 60   # every 60 seconds

    # Daily generation settings
    DAILY_SOCIAL_POSTS_PER_PLATFORM = 2
    DAILY_BRAND_IDEAS = 2
    DAILY_LEADS = 5
    DAILY_COLD_EMAILS = 3
    DAILY_COLD_DMS = 3

    APP_NAME = "BrandWriter AI"
    VERSION = "1.0.0"
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"

settings = Settings()
