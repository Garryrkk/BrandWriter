# backend/app/db/create_tables.py

import sys
import os

# Add project root to sys.path so 'app' can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

# Import database objects
from app.db.database import Base, engine

# Import all models so tables are created in correct order
from app.models.user import User
from app.models.brand import Brand
from app.draft.DraftModels import Draft

# Create all tables
Base.metadata.create_all(bind=engine)

print("✅ Tables created successfully!")
