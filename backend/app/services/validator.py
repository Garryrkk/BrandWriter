import dns.resolver

def is_valid(email: str) -> bool:
    try:
        domain = email.split("@")[1]
        dns.resolver.resolve(domain, "MX")
        return True
    except:
        return False
def validate_email(email: str) -> bool:
    return is_valid(email)