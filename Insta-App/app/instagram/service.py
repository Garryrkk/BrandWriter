from datetime import datetime
from app.instagram.schemas import InstagramPostRequest
from app.instagram.client import get_instagram_client


class InstagramService:

    @staticmethod
    async def handle_post(payload: InstagramPostRequest):
        client = get_instagram_client()

        if payload.post_type == "carousel":
            media_ids = []
            for url in payload.media_urls:
                path = client.download_media(url)
                media_ids.append(path)

            insta_id = client.post_carousel(
                media_ids=media_ids,
                caption=payload.caption
            )

        elif payload.post_type == "post":
            path = client.download_media(payload.media_urls[0])
            insta_id = client.post_photo(path, payload.caption)

        elif payload.post_type == "reel":
            path = client.download_media(payload.media_urls[0])
            insta_id = client.post_reel(path, payload.caption)

        elif payload.post_type == "story":
            path = client.download_media(payload.media_urls[0])
            insta_id = client.post_story(path)

        else:
            raise ValueError("Unsupported post_type")

        return {
            "status": "success",
            "instagram_post_id": str(insta_id),
            "posted_at": datetime.utcnow()
        }
