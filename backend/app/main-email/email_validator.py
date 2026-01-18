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

# DECISION MAKER ROLES (SINGLE SOURCE OF TRUTH)
DECISION_MAKER_ROLES = {
    "Founder", "Co-Founder", "CEO", "CTO", "CFO", "COO",
    "Chief Technology Officer", "Chief Executive Officer",
    "Chief Product Officer", "Chief Operating Officer",
    "Head of Engineering", "VP Engineering", "VP of Engineering",
    "Engineering Manager", "Staff Engineer",
    "Principal Engineer", "Founding Engineer",
    "Platform Lead", "Infrastructure Lead",
    "Head of Product", "VP Product", "VP of Product",
    "Growth Lead", "Head of Growth",
    "VP Sales", "Head of Sales", "VP of Sales",
    "Agency Owner", "Partner",
    "HR Lead", "Head of People", "Head of HR"
}

# Blocked domains (hard stop)
BLOCKED_DOMAINS = [
    ".gov", ".edu", ".mil",
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
    "aol.com", "icloud.com", "protonmail.com",
    "example.com", "test.com", "demo.com"
]

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


def is_company_domain_match(email: str, company_domain: str) -> bool:
    """
    HARD RULE: Email must belong to company domain
    Returns True only if email domain matches company domain
    """
    if not email or not company_domain:
        return False
    
    email_domain = email.split("@")[1].lower()
    company_domain = company_domain.lower()
    
    # Remove www. if present
    company_domain = company_domain.replace("www.", "")
    
    # Exact match or subdomain match
    return email_domain == company_domain or email_domain.endswith(f".{company_domain}")


def is_blocked_domain(email: str) -> bool:
    """
    Check if email is from blocked domain (Gmail, Yahoo, personal emails, etc.)
    Returns True if blocked
    """
    domain = email.split("@")[1].lower()
    
    # Check exact matches
    if any(blocked == domain for blocked in BLOCKED_DOMAINS):
        return True
    
    # Check domain endings (e.g., .gov, .edu)
    if any(domain.endswith(blocked) for blocked in BLOCKED_DOMAINS if blocked.startswith(".")):
        return True
    
    return False


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


def check_mx_record(domain: str) -> Tuple[bool, Optional[str]]:
    """
    Check if domain has valid MX records
    Returns (has_mx, mx_host)
    """
    try:
        mx_records = dns.resolver.resolve(domain, 'MX')
        if len(mx_records) > 0:
            mx_host = str(mx_records[0].exchange).rstrip('.')
            return True, mx_host
        return False, None
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers):
        return False, None
    except Exception:
        return True, None


def verify_smtp(email: str, timeout: int = 10) -> Tuple[bool, str]:
    """
    Verify email via SMTP (without sending)
    Returns (is_valid, message)
    """
    try:
        domain = email.split('@')[1]
        
        has_mx, mx_host = check_mx_record(domain)
        if not has_mx or not mx_host:
            return False, "No MX records found"
        
        with smtplib.SMTP(timeout=timeout) as smtp:
            smtp.set_debuglevel(0)
            smtp.connect(mx_host)
            smtp.helo('verification.test')
            smtp.mail('verify@example.com')
            code, message = smtp.rcpt(email)
            
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
        return True, f"SMTP verification unavailable: {str(e)}"


def calculate_confidence_score(
    email: str,
    domain_match: bool,
    role_confidence: float,
    discovery_method: str,
    page_credibility: float,
    mx_valid: bool
) -> Tuple[float, str]:
    """
    Calculate realistic confidence score (0.0 - 1.0)
    
    Weighted scoring:
    +0.40 domain match
    +0.20 role confidence
    +0.15 email pattern strength
    +0.15 page source credibility
    +0.10 MX valid
    """
    score = 0.0
    
    # Domain match (40 points)
    if domain_match:
        score += 0.40
    
    # Role confidence (20 points)
    score += role_confidence * 0.20
    
    # Email pattern strength (15 points)
    if discovery_method == "regex":
        score += 0.15  # Direct discovery
    elif discovery_method == "structured":
        score += 0.13  # Structured extraction
    elif discovery_method == "inferred":
        # Pattern-guessed emails capped lower
        local_part = email.split("@")[0]
        if "." in local_part:  # firstname.lastname
            score += 0.12
        elif len(local_part.split()) == 1 and len(local_part) > 3:  # single name
            score += 0.08  # Lower for single-name
        else:
            score += 0.10
    
    # Page credibility (15 points)
    score += page_credibility * 0.15
    
    # MX valid (10 points)
    if mx_valid:
        score += 0.10
    
    # Apply caps
    if discovery_method == "inferred":
        local_part = email.split("@")[0]
        # Single-name emails max 0.70
        if "." not in local_part and len(local_part) <= 10:
            score = min(score, 0.70)
        else:
            # Pattern-guessed emails max 0.85
            score = min(score, 0.85)
    
    # Determine confidence level
    if score >= 0.80:
        level = "high"
    elif score >= 0.60:
        level = "medium"
    else:
        level = "low"
    
    return round(score, 2), level


def validate_email_full(
    email: str,
    company_domain: str,
    role_confidence: float = 1.0,
    discovery_method: str = "regex",
    page_credibility: float = 1.0,
    check_mx: bool = True,
    check_smtp: bool = False
) -> Dict[str, any]:
    """
    Complete email validation pipeline with company domain enforcement
    Returns dict with validation results
    """
    result = {
        'is_valid': False,
        'quality_score': 0,
        'confidence_score': 0.0,
        'confidence_level': 'low',
        'verification_status': 'invalid',
        'mx_valid': False,
        'smtp_valid': False,
        'is_disposable': False,
        'is_role_email': False,
        'domain_match': False,
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
    
    # HARD RULE: Domain must match company
    domain_match = is_company_domain_match(email, company_domain)
    result['domain_match'] = domain_match
    
    if not domain_match:
        result['reason'] = f"Email domain does not match company domain ({company_domain})"
        return result
    
    # Blocked domain check (Gmail, Yahoo, etc.)
    if is_blocked_domain(email):
        result['reason'] = "Blocked domain (personal email provider)"
        return result
    
    # Disposable email check
    if is_disposable_email(email):
        result['is_disposable'] = True
        result['reason'] = "Disposable email domain"
        return result
    
    # MX record check
    if check_mx:
        mx_valid, mx_host = check_mx_record(email.split("@")[1])
        result['mx_valid'] = mx_valid
        result['mx_host'] = mx_host
        
        if not mx_valid:
            result['reason'] = "No MX records found"
            result['verification_status'] = 'invalid'
            return result
    
    # SMTP verification (optional)
    if check_smtp:
        smtp_valid, smtp_message = verify_smtp(email)
        result['smtp_valid'] = smtp_valid
        
        if not smtp_valid and "unavailable" not in smtp_message:
            result['reason'] = smtp_message
            result['verification_status'] = 'risky'
            
            # Calculate confidence anyway
            confidence_score, confidence_level = calculate_confidence_score(
                email,
                domain_match,
                role_confidence,
                discovery_method,
                page_credibility,
                result['mx_valid']
            )
            result['confidence_score'] = confidence_score
            result['confidence_level'] = confidence_level
            result['quality_score'] = int(confidence_score * 100)
            result['is_valid'] = True
            return result
    
    # Calculate confidence score
    confidence_score, confidence_level = calculate_confidence_score(
        email,
        domain_match,
        role_confidence,
        discovery_method,
        page_credibility,
        result['mx_valid']
    )
    
    result['confidence_score'] = confidence_score
    result['confidence_level'] = confidence_level
    result['quality_score'] = int(confidence_score * 100)
    
    # HARD GATE: Quality score must be >= 70
    if result['quality_score'] < 70:
        result['reason'] = f"Quality score too low ({result['quality_score']})"
        result['verification_status'] = 'invalid'
        return result
    
    # Success
    result['is_valid'] = True
    result['verification_status'] = 'valid'
    result['reason'] = "Valid email"
    
    return result


def is_allowed_role(role: str) -> bool:
    """
    HARD GATE: Check if role is in DECISION_MAKER_ROLES
    Returns True if role is acceptable for targeting
    """
    if not role:
        return False
    
    role_normalized = role.strip()
    
    # Check exact match (case-insensitive)
    return role_normalized in DECISION_MAKER_ROLES


def normalize_role(role: str) -> Optional[str]:
    """
    Normalize role to match DECISION_MAKER_ROLES
    Returns normalized role or None if not found
    """
    if not role:
        return None
    
    role_lower = role.lower().strip()
    
    # Try exact match first
    for decision_role in DECISION_MAKER_ROLES:
        if role_lower == decision_role.lower():
            return decision_role
    
    # Try partial match
    for decision_role in DECISION_MAKER_ROLES:
        if decision_role.lower() in role_lower or role_lower in decision_role.lower():
            return decision_role
    
    return None


def batch_validate_emails(
    emails: list,
    company_domain: str,
    check_mx: bool = True,
    check_smtp: bool = False
) -> Dict[str, list]:
    """
    Validate multiple emails at once
    Returns dict with categorized results
    """
    results = {
        'valid': [],
        'invalid': [],
        'risky': []
    }
    
    for email_data in emails:
        email = email_data.get('email')
        
        validation = validate_email_full(
            email,
            company_domain,
            role_confidence=email_data.get('role_confidence', 1.0),
            discovery_method=email_data.get('discovery_method', 'regex'),
            page_credibility=email_data.get('page_credibility', 1.0),
            check_mx=check_mx,
            check_smtp=check_smtp
        )
        
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