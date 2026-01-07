from pydantic import BaseModel

class SendDailyOut(BaseModel):
    sent: int
    new: int
    repeated: int