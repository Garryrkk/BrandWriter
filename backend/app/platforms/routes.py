from fastapi import APIRouter, HTTPException
from app.platforms.validators.platform_validator import validate_before_schedule

router = APIRouter(prefix="/platforms", tags=["Platforms"])


@router.post("/validate/{platform}")
def validate_platform(platform: str, payload: dict):
    """
    Validate content and assets before scheduling for a specific platform.
    Checks character limits, media requirements, etc.
    """
    try:
        validate_before_schedule(
            platform=platform,
            content=payload.get("content", ""),
            assets=payload.get("assets", [])
        )
        return {"status": "valid", "platform": platform}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
