class LinkedInValidationError(Exception):
    pass

def validate_linkedin_post(text: str, assets: list | None):
    if len(text) > 3000:
        raise LinkedInValidationError("LinkedIn post exceeds 3000 chars")

    if assets and len(assets) > 9:
        raise LinkedInValidationError("LinkedIn max 9 images")