from pydantic import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Insta-App"
    ENV: str = "development"

    # Instagram Credentials
    IG_USERNAME: str
    IG_PASSWORD: str

    # Optional (recommended)
    IG_PROXY: Optional[str] = None
    IG_SESSION_PATH: str = "./sessions/instagram.json"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 9000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings
