"""
Email validation and quality filtering module
Validates email format, domain, and quality scoring
Includes SMTP verification and disposable email detection
"""

import re
import dns.resolver
import smtplib
import socket
from typing import Tuple, Optional, Dict
from email.utils import parseaddr

# Blocked email prefixes (hard stop)
BLOCKED_PREFIXES = [
    "info", "support", "help", "hello",
    "noreply", "no-reply", "privacy",
    "security", "abuse", "careers",
    "jobs", "admin", "webmaster",
    "legal", "partnerships", "contact",
    "sales", "billing", "finance",
    "marketing", "hr", "recruiting"
]

# Allowed top-level domains (heuristic, not decisive)
ALLOWED_TLDS = [".com", ".ai", ".io", ".app", ".dev", ".co", ".net", ".org"]

# Blocked domains
BLOCKED_DOMAINS = [".gov", ".edu", ".mil"]

# Common disposable email domains
DISPOSABLE_DOMAINS = [
    "tempmail.com", "guerrillamail.com", "10minutemail.com",
    "throwaway.email", "mailinator.com", "maildrop.cc",
    "trashmail.com", "getnada.com", "temp-mail.org"
]

# Pattern for human-like emails
HUMAN_EMAIL_PATTERNS = [
    r'^[a-z]+@',  # firstname@
    r'^[a-z]+\.[a-z]+@',  # firstname.lastname@
    r'^[a-z][a-z]+@',  # firstinitiallastname@
    r'^[a-z]\.[a-z]+@',  # f.lastname@
]


def validate_email_format(email: str) -> bool:
    """
    Validate basic email format
    Returns True if format is valid
    """
    if not email or "@" not in email:
        return False
    
    # Basic RFC 5322 regex (simplified)
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email.lower()))


def is_blocked_prefix(email: str) -> bool:
    """
    Check if email starts with blocked prefix
    Returns True if blocked (should be discarded)
    """
    local_part = email.split("@")[0].lower()
    return any(local_part.startswith(prefix) for prefix in BLOCKED_PREFIXES)


def is_disposable_email(email: str) -> bool:
    """
    Check if email is from disposable domain
    Returns True if disposable
    """
    domain = email.split("@")[1].lower()
    return any(disposable in domain for disposable in DISPOSABLE_DOMAINS)


def is_human_like(email: str) -> bool:
    """
    Check if email matches human-like pattern
    Returns True if likely a personal email
    """
    email_lower = email.lower()
    return any(re.match(pattern, email_lower) for pattern in HUMAN_EMAIL_PATTERNS)


def validate_domain(domain: str) -> Tuple[bool, str]:
    """
    Validate domain heuristics and reputation
    Returns (is_valid, reason)
    """
    domain_lower = domain.lower()
    
    # Check blocked domains
    for blocked in BLOCKED_DOMAINS:
        if domain_lower.endswith(blocked):
            return False, f"Blocked domain type: {blocked}"
    
    # Check allowed TLDs (heuristic - not decisive)
    has_allowed_tld = any(domain_lower.endswith(tld) for tld in ALLOWED_TLDS)
    if not has_allowed_tld:
        # Not a hard block, just lower score
        return True, "Non-preferred TLD"
    
    return True, "Valid"


def check_mx_record(domain: str) -> Tuple[bool, Optional[str]]:
    """
    Check if domain has valid MX records
    Returns (has_mx, mx_host)
    """
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if len(mx_records) > 0:
            # Return the primary MX host
            mx_host = str(mx_records[0].exchange).rstrip('.')
            return True, mx_host
        return False, None
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
        return False, None
    except Exception as e:
        # Network issues, etc. - assume valid to avoid false negatives
        return True, None


def verify_smtp(email: str, timeout: int = 10) -> Tuple[bool, str]:
    """
    Verify email via SMTP (without sending)
    Returns (is_valid, message)
    """
    try:
        domain = email.split('@')[1]
        
        # Get MX record
        has_mx, mx_host = check_mx_record(domain)
        if not has_mx or not mx_host:
            return False, "No MX records found"
        
        # Connect to SMTP server
        with smtplib.SMTP(timeout=timeout) as smtp:
            smtp.set_debuglevel(0)
            smtp.connect(mx_host)
            smtp.helo('verification.test')
            smtp.mail('verify@example.com')
            code, message = smtp.rcpt(email)
            
            # 250 = success, 251 = user not local (but will forward)
            if code in [250, 251]:
                return True, "Valid"
            else:
                return False, f"SMTP error: {code} {message.decode()}"
                
    except smtplib.SMTPServerDisconnected:
        return False, "SMTP server disconnected"
    except smtplib.SMTPConnectError:
        return False, "Cannot connect to SMTP server"
    except socket.timeout:
        return False, "SMTP timeout"
    except Exception as e:
        # Many servers block SMTP verification, so don't hard fail
        return True, f"SMTP verification unavailable: {str(e)}"


def calculate_quality_score(email: str, mx_valid: bool = False, smtp_valid: bool = False) -> int:
    """
    Calculate quality score for email (0-100)
    Higher score = better quality
    """
    score = 50  # Start at neutral
    
    if not validate_email_format(email):
        return 0
    
    if is_blocked_prefix(email):
        return 0
    
    if is_disposable_email(email):
        return 0
    
    local_part, domain = email.split("@")
    
    # Human-like pattern: +20
    if is_human_like(email):
        score += 20
    
    # Short local part (likely first name): +10
    if len(local_part) <= 10:
        score += 10
    
    # Preferred TLD: +10
    domain_valid, reason = validate_domain(domain)
    if domain_valid and reason == "Valid":
        score += 10
    
    # No numbers in local part: +5
    if not any(char.isdigit() for char in local_part):
        score += 5
    
    # No underscores or plus signs: +5
    if "_" not in local_part and "+" not in local_part:
        score += 5
    
    # MX record valid: +10
    if mx_valid:
        score += 10
    
    # SMTP verified: +15
    if smtp_valid:
        score += 15
    
    return min(score, 100)


def validate_email_full(
    email: str,
    check_mx: bool = True,
    check_smtp: bool = False
) -> Dict[str, any]:
    """
    Complete email validation pipeline
    Returns dict with validation results
    """
    result = {
        'is_valid': False,
        'quality_score': 0,
        'verification_status': 'invalid',
        'mx_valid': False,
        'smtp_valid': False,
        'is_disposable': False,
        'is_role_email': False,
        'reason': '',
        'mx_host': None
    }
    
    # Format check
    if not validate_email_format(email):
        result['reason'] = "Invalid email format"
        return result
    
    # Blocked prefix check
    if is_blocked_prefix(email):
        result['is_role_email'] = True
        result['reason'] = "Blocked prefix (inbox/role email)"
        return result
    
    # Disposable email check
    if is_disposable_email(email):
        result['is_disposable'] = True
        result['reason'] = "Disposable email domain"
        return result
    
    domain = email.split("@")[1]
    
    # Domain validation
    domain_valid, domain_reason = validate_domain(domain)
    if not domain_valid:
        result['reason'] = domain_reason
        return result
    
    # MX record check
    if check_mx:
        mx_valid, mx_host = check_mx_record(domain)
        result['mx_valid'] = mx_valid
        result['mx_host'] = mx_host
        
        if not mx_valid:
            result['reason'] = "No MX records found"
            result['verification_status'] = 'invalid'
            return result
    
    # SMTP verification (optional, can be slow)
    if check_smtp:
        smtp_valid, smtp_message = verify_smtp(email)
        result['smtp_valid'] = smtp_valid
        
        if not smtp_valid and "unavailable" not in smtp_message:
            result['reason'] = smtp_message
            result['verification_status'] = 'risky'
            result['quality_score'] = calculate_quality_score(
                email,
                result['mx_valid'],
                False
            )
            # Still mark as valid but risky
            result['is_valid'] = True
            return result
    
    # Calculate quality score
    quality_score = calculate_quality_score(
        email,
        result['mx_valid'],
        result['smtp_valid']
    )
    
    result['quality_score'] = quality_score
    
    if quality_score < 40:
        result['reason'] = "Quality score too low"
        result['verification_status'] = 'invalid'
        return result
    
    # Success
    result['is_valid'] = True
    result['verification_status'] = 'valid'
    result['reason'] = "Valid email"
    
    return result


def is_allowed_role(role: str) -> bool:
    """
    Check if role is in allowed list
    Returns True if role is acceptable for targeting
    """
    ALLOWED_ROLES = [
        "founder", "co-founder", "ceo", "cto", "chief",
        "founding engineer", "staff engineer",
        "engineering manager", "head of engineering",
        "head of product", "platform lead",
        "infrastructure lead", "growth lead",
        "marketing lead", "sales lead", "vp",
        "recruiter", "hr", "agency owner",
        "director", "principal", "owner"
    ]
    
    role_lower = role.lower()
    return any(allowed in role_lower for allowed in ALLOWED_ROLES)


def batch_validate_emails(emails: list, check_mx: bool = True, check_smtp: bool = False) -> Dict[str, list]:
    """
    Validate multiple emails at once
    Returns dict with categorized results
    """
    results = {
        'valid': [],
        'invalid': [],
        'risky': []
    }
    
    for email in emails:
        validation = validate_email_full(email, check_mx, check_smtp)
        
        email_result = {
            'email': email,
            'validation': validation
        }
        
        if validation['is_valid']:
            if validation['verification_status'] == 'valid':
                results['valid'].append(email_result)
            else:
                results['risky'].append(email_result)
        else:
            results['invalid'].append(email_result)
    
    return results