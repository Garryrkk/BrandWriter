"""
Platform-specific validation rules for content and assets.
"""

PLATFORM_RULES = {
    "instagram": {
        "max_caption_length": 2200,
        "max_hashtags": 30,
        "allowed_media_types": ["image/jpeg", "image/png", "video/mp4"],
        "max_images": 10,
        "max_video_duration": 60,  # seconds for feed posts
    },
    "linkedin": {
        "max_content_length": 3000,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif", "video/mp4"],
        "max_images": 9,
    },
    "twitter": {
        "max_content_length": 280,
        "allowed_media_types": ["image/jpeg", "image/png", "image/gif", "video/mp4"],
        "max_images": 4,
    },
    "youtube": {
        "max_title_length": 100,
        "max_description_length": 5000,
        "allowed_media_types": ["video/mp4", "video/quicktime"],
    },
    "email": {
        "max_subject_length": 150,
        "max_body_length": 50000,
    }
}


def validate_before_schedule(platform: str, content: str, assets: list = None):
    """
    Validate content and assets against platform-specific rules.
    Raises ValueError if validation fails.
    """
    platform = platform.lower()
    
    if platform not in PLATFORM_RULES:
        raise ValueError(f"Unknown platform: {platform}")
    
    rules = PLATFORM_RULES[platform]
    assets = assets or []
    
    # Check content length
    max_length_key = next(
        (k for k in rules if "length" in k and "content" in k or "caption" in k),
        None
    )
    if max_length_key and len(content) > rules[max_length_key]:
        raise ValueError(
            f"Content exceeds {platform} limit of {rules[max_length_key]} characters"
        )
    
    # Check number of assets
    max_images_key = "max_images"
    if max_images_key in rules and len(assets) > rules[max_images_key]:
        raise ValueError(
            f"Too many assets for {platform}. Maximum: {rules[max_images_key]}"
        )
    
    # Instagram-specific: check hashtag count
    if platform == "instagram":
        hashtag_count = content.count("#")
        if hashtag_count > rules.get("max_hashtags", 30):
            raise ValueError(f"Too many hashtags. Instagram allows max {rules['max_hashtags']}")
    
    return True
