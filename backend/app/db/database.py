from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# ─────────────────────────────────────
# SQLAlchemy Base
# ─────────────────────────────────────
Base = declarative_base()

# ─────────────────────────────────────
# PostgreSQL (SQLAlchemy)
# ─────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ─────────────────────────────────────
# FastAPI Dependency
# ─────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─────────────────────────────────────
# MongoDB (Motor async client)
# ─────────────────────────────────────
MONGO_URL = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client[MONGO_DB_NAME]

# ─────────────────────────────────────
# Init DB
# ─────────────────────────────────────
def init_db():
    try:
        engine.connect()
        print("PostgreSQL connected successfully.")

        mongo_client.admin.command("ping")
        print("MongoDB connected successfully.")
    except Exception as e:
        print("Database initialization error:", e)
