from app.db.database import Base, engine
from app.models.brand import Brand
from app.draft.DraftModels import Draft

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")
