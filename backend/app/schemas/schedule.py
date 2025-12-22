"""
Schedule schemas for API requests/responses.
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ScheduleCreateFromBasket(BaseModel):
    """Schema for creating a schedule from a basket."""
    basket_id: UUID
    platform: str
    scheduled_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "basket_id": "123e4567-e89b-12d3-a456-426614174000",
                "platform": "instagram",
                "scheduled_at": "2025-12-20T10:00:00Z"
            }
        }


class ScheduleResponse(BaseModel):
    """Response schema for a schedule."""
    id: UUID
    basket_id: UUID
    platform: str
    scheduled_at: datetime
    status: str  # pending, scheduled, completed, failed
    frozen_content: Optional[str] = None
    frozen_assets: Optional[List[str]] = None
    idempotency_key: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
