import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    VOYAGE_API_KEY = os.getenv("VOYAGE_API_KEY")
    VOYAGE_MODEL = "voyage-large-3"
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
    
    # Models & HuggingFace Tokens from .env
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL")
    HF_TOKEN = os.getenv("HF_TOKEN")
    LOCAL_LLM_PATH = os.getenv("LOCAL_LLM_PATH")

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
    DEBUG = True

settings = Settings()
