from sqlalchemy import Column, Integer, String, Text, JSON
from app.db.database import Base


class Template(Base):
    __tablename__ = "templates"


id = Column(Integer, primary_key=True, index=True)
name = Column(String, nullable=False)
category = Column(String, nullable=True)
instructions = Column(Text)
example_prompts = Column(JSON)