class EmailValidationError(Exception):
    pass

def validate_email(subject: str, body: str):
    if len(subject) > 78:
        raise EmailValidationError("Email subject too long")

    if not body.strip():
        raise EmailValidationError("Email body empty")