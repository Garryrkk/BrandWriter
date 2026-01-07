from typing import List, Dict

class InstagramValidationError(Exception):
    pass

def validate_instagram_post(post_type: str, assets: List[Dict], caption: str):
    if post_type == "carousel":
        if not (2 <= len(assets) <= 10):
            raise InstagramValidationError("Instagram carousel must have 2–10 images")

        for asset in assets:
            if asset.get("type") != "image":
                raise InstagramValidationError("Carousel supports images only")

            if asset.get("ratio") != "1:1":
                raise InstagramValidationError("Instagram images must be 1:1")

    if post_type == "reel":
        video = assets[0]
        if video["duration"] > 90:
            raise InstagramValidationError("Reels must be ≤ 90 seconds")

        if video["size_mb"] > 100:
            raise InstagramValidationError("Reel size exceeds limit")

    if len(caption) > 2200:
        raise InstagramValidationError("Caption exceeds Instagram limit")