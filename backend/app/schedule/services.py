from app.platforms.validators.instagram import validate_instagram_post
from app.platforms.validators.linkedin import validate_linkedin_post

def validate_before_schedule(platform: str, content: dict, assets: list):
    if platform == "instagram":
        validate_instagram_post(
            post_type=content["post_type"],
            assets=assets,
            caption=content["caption"]
        )

    elif platform == "linkedin":
        validate_linkedin_post(content["text"], assets)