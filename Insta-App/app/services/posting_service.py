import httpx

async def post_to_instagram(job):
    async with httpx.AsyncClient() as client:
        await client.post(
            "http://insta-app:9000/instagram/post",
            json={
                "platform": "instagram",
                "post_type": job.type,
                "caption": job.caption,
                "media_urls": job.media_urls,
                "scheduled_at": job.scheduled_at.isoformat(),
                "metadata": {
                    "brand_id": job.brand_id,
                    "basket_id": job.basket_id,
                }
            }
        )
