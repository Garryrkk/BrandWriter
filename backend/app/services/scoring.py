from app.seed_corpora.brand_1.roles import ROLE_CLUSTERS
from app.seed_corpora.brand_1.keywords import KEYWORDS


def score_lead(text: str) -> tuple[int, str]:
    score = 0
    bucket = "UNKNOWN"

    # Role score
    for role in ROLE_CLUSTERS["IC"]:
        if role in text:
            score += 40
            bucket = "BUILDER"
            break

    for role in ROLE_CLUSTERS["SENIOR_IC"]:
        if role in text:
            score += 30
            bucket = "BUILDER"
            break

    for role in ROLE_CLUSTERS["LEADERSHIP"]:
        if role in text:
            score += 25
            bucket = "BUYER"
            break

    for role in ROLE_CLUSTERS["FOUNDERS"]:
        if role in text:
            score += 35
            bucket = "FOUNDER"
            break

    # Keyword score
    score += min(35, (
        15 * sum(k in text for k in KEYWORDS["GENAI"]) +
        10 * sum(k in text for k in KEYWORDS["MLOPS"]) +
        5 * sum(k in text for k in KEYWORDS["CORE"])
    ))

    # Seniority
    if any(s in text for s in ["senior", "lead", "staff", "principal"]):
        score += 15

    return min(score, 100), bucket
