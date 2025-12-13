# app/services/instagram_service.py
import os
import httpx
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

# Import your Instagrappy client — adjust import to actual library
try:
    from instagrapi  import Client
except Exception:
    Client = None

class InstagramService:
    def __init__(self, username: Optional[str]=None, password: Optional[str]=None):
        self.username = username or os.getenv("INSTAGRAPY_USERNAME")
        self.password = password or os.getenv("INSTAGRAPY_PASSWORD")
        self.client = None

    def login(self, username=None, password=None):
        u = username or self.username
        p = password or self.password
        if Client is None:
            raise RuntimeError("Instagrappy library not installed or import failed")
        self.client = Client(username=u, password=p)
        self.client.login()
        return True

    def logout(self):
        if self.client:
            self.client.logout()
            self.client = None
        return True

    def upload_media_from_url(self, url: str, is_video: bool = False) -> str:
        """
        Downloads file then uploads via instagrappy; returns internal upload id or media id.
        """
        # download file to temp
        with httpx.Client(timeout=60) as c:
            r = c.get(url)
            r.raise_for_status()
            ext = "mp4" if is_video else "jpg"
            tmp_path = f"/tmp/insta_upload_{os.getpid()}.{ext}"
            with open(tmp_path, "wb") as f:
                f.write(r.content)
        # now ask client to upload (API differs by library)
        if not self.client:
            self.login()
        # placeholder: update to actual upload call
        media_id = self.client.upload_photo(tmp_path) if not is_video else self.client.upload_video(tmp_path)
        return media_id

    def post_photo(self, caption: str, media_ids: List[str]) -> dict:
        """
        Post single photo or carousel if multiple media_ids
        """
        if not self.client:
            self.login()
        if len(media_ids) == 1:
            return self.client.post_photo(media_ids[0], caption=caption)
        else:
            return self.client.post_carousel(media_ids, caption=caption)

    def post_story(self, media_id: str, caption: Optional[str] = None) -> dict:
        if not self.client:
            self.login()
        return self.client.post_story(media_id, caption=caption)

    def post_reel(self, media_id: str, caption: Optional[str]=None) -> dict:
        if not self.client:
            self.login()
        return self.client.post_reel(media_id, caption=caption)

    def get_insights(self, post_id: str) -> dict:
        if not self.client:
            self.login()
        return self.client.get_insights(post_id)
