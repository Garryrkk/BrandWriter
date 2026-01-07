"""
Observability service - handles logging of posting attempts and system metrics.
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
import json

# In-memory store for development (replace with database/Redis in production)
_posting_logs: List[Dict[str, Any]] = []


def create_log(log_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a new posting log entry.
    """
    log_entry = {
        "id": len(_posting_logs) + 1,
        "schedule_id": log_data.get("schedule_id"),
        "platform": log_data.get("platform"),
        "status": log_data.get("status"),  # success, failed, pending
        "error": log_data.get("error"),
        "latency_ms": log_data.get("latency_ms"),
        "timestamp": log_data.get("timestamp") or datetime.utcnow().isoformat(),
        "metadata": log_data.get("metadata", {})
    }
    _posting_logs.append(log_entry)
    return log_entry


def get_logs(schedule_id: str) -> List[Dict[str, Any]]:
    """
    Get all logs for a specific schedule.
    """
    return [log for log in _posting_logs if log.get("schedule_id") == schedule_id]


def get_logs_by_platform(
    platform: str,
    limit: int = 50,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get logs filtered by platform and optionally by status.
    """
    filtered = [log for log in _posting_logs if log.get("platform") == platform.lower()]
    
    if status:
        filtered = [log for log in filtered if log.get("status") == status]
    
    # Return most recent first, limited
    return sorted(filtered, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]


def get_stats(platform: Optional[str] = None) -> Dict[str, Any]:
    """
    Get aggregated statistics for posting attempts.
    """
    logs = _posting_logs
    if platform:
        logs = [log for log in logs if log.get("platform") == platform.lower()]
    
    total = len(logs)
    success = len([log for log in logs if log.get("status") == "success"])
    failed = len([log for log in logs if log.get("status") == "failed"])
    
    avg_latency = 0
    if logs:
        latencies = [log.get("latency_ms", 0) for log in logs if log.get("latency_ms")]
        avg_latency = sum(latencies) / len(latencies) if latencies else 0
    
    return {
        "total": total,
        "success": success,
        "failed": failed,
        "success_rate": (success / total * 100) if total > 0 else 0,
        "avg_latency_ms": round(avg_latency, 2)
    }
