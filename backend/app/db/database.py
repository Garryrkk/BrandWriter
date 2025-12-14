from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

# Base
Base = declarative_base()

# =============== PostgreSQL (Async SQLAlchemy) ===============

_db_url = os.getenv("DATABASE_URL", "")
# Convert to async driver URL if needed
if _db_url.startswith("postgres://"):
    DATABASE_URL = _db_url.replace("postgres://", "postgresql+asyncpg://")
elif _db_url.startswith("postgresql://") and "+asyncpg" not in _db_url:
    DATABASE_URL = _db_url.replace("postgresql://", "postgresql+asyncpg://")
else:
    DATABASE_URL = _db_url

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# 👉 alias for backward compatibility
SessionLocal = AsyncSessionLocal

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# =============== MongoDB (Motor) ===============

MONGO_URL = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

mongo_client = AsyncIOMotorClient(MONGO_URL)
mongo_db = mongo_client[MONGO_DB_NAME]

# =============== Init DB ===============
async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("PostgreSQL connected.")

        await mongo_client.admin.command("ping")
        print("MongoDB connected.")
    except Exception as e:
        print("Database initialization error:", e)
