import requests
from app.core.config import settings

def fetch_emails_from_voyage(domain: str) -> list[str]:
    response = requests.post(
        settings.VOYAGE_ENDPOINT,
        headers={"Authorization": f"Bearer {settings.VOYAGE_API_KEY}"},
        json={"domain": domain}
    )

    if response.status_code != 200:
        return []

    data = response.json()
    return [item["email"] for item in data.get("emails", [])]