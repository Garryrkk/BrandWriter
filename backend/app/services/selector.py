from datetime import date
import random

DAILY_LIMIT = 100
REPEAT_MIN = 10
REPEAT_MAX = 15

def select_daily(db):
    today = date.today()

    sent_before = db.get_sent_emails()
    never_sent = db.get_unsent_emails()

    repeat_count = min(
        random.randint(REPEAT_MIN, REPEAT_MAX),
        len(sent_before)
    )

    repeats = random.sample(sent_before, repeat_count)
    fresh = random.sample(
        never_sent,
        DAILY_LIMIT - repeat_count
    )

    return fresh, repeats