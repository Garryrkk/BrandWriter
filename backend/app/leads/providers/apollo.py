"""
ApolloProvider

⚠️ IMPORTANT:
We are NOT using Apollo API currently.

This provider is intentionally kept as a placeholder so that:
- The LeadProvider interface remains stable
- The rest of the system (writers, basket, scheduler) is not coupled
- We can plug in our own internal scraper later without refactoring

The internal email + LinkedIn scraper implementation will be added here.
"""

from .base import LeadProvider

class ApolloProvider(LeadProvider):
    """
    Placeholder provider for internal lead scraping engine.

    Future responsibilities:
    - Scrape LinkedIn profiles
    - Extract verified emails
    - Enrich company + title
    - Respect rate limits
    - Return normalized lead objects
    """

    def fetch(self, filters: dict, limit: int = 100):
        """
        TODO:
        Replace this with internal scraping logic.

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
