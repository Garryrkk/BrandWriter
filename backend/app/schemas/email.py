from pydantic import BaseModel

class EmailOut(BaseModel):
    email: str
    repeat: bool

    class Config:
        from_attributes = True