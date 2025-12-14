from instagrapi import Client
from app.core.config import settings

_client = None


def get_instagram_client():
    global _client

    if _client is None:
        cl = Client()
        cl.login(settings.IG_USERNAME, settings.IG_PASSWORD)
        _client = cl

    return _client
