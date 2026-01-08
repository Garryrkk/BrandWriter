from datetime import datetime, timedelta
from app.core.config import settings


def should_surface(last_seen: datetime) -> bool:
    if not last_seen:
        return True
    return datetime.utcnow() - last_seen > timedelta(days=settings.LEAD_COOLDOWN_DAYS)
