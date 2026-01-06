from app.seed_corpora.brand_1.exclusions import EXCLUSIONS
import re

def normalize(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return f" {text} "

def contains_exclusion(text: str) -> bool:
    return any(excl in text for excl in EXCLUSIONS)


def match_keywords(text: str, keywords: list) -> int:
    return sum(1 for k in keywords if k in text)
