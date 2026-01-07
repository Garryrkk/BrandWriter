class YouTubeValidationError(Exception):
    pass

def validate_youtube_short(video: dict):
    if video["duration"] > 60:
        raise YouTubeValidationError("Shorts must be ≤ 60 seconds")

    if video["ratio"] != "9:16":
        raise YouTubeValidationError("Shorts must be vertical")