"""
HunterProvider

⚠️ IMPORTANT:
We are NOT using the Hunter API.

This provider is intentionally kept as a placeholder so that:
- LeadProvider interface remains stable
- The rest of the system does NOT depend on paid APIs
- Our internal email + LinkedIn scraper can be plugged in here later

Do NOT remove this file.
Do NOT change the return structure.
"""

from .base import LeadProvider

class HunterProvider(LeadProvider):
    """
    Placeholder provider for internal email discovery engine.

    Future responsibilities:
    - Domain-based email discovery
    - Role-based email guessing
    - Email verification
    - Deduplication
    - Source attribution
    """

    def fetch(self, filters: dict, limit: int = 100):
        """
        TODO:
        Replace this with internal email discovery logic.

        Expected return format (DO NOT CHANGE):

        [
            {
                "email": str | None,
                "linkedin_url": str | None,
                "full_name": str | None,
                "company": str | None,
                "title": str | None,
                "verified": bool,
                "source": "internal_scraper"
            }
        ]
        """

        # 🔴 Placeholder return to avoid breaking pipelines
        return []
