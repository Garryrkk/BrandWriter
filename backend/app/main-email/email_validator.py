import re
import dns.resolver
import logging

logger = logging.getLogger(__name__)

class EmailValidator:
    def __init__(self):
        self.disposable_domains = [
            'guerrillamail.com', 'tempmail.com', '10minutemail.com',
            'mailinator.com', 'throwaway.email', 'temp-mail.org',
            'fakeinbox.com', 'trashmail.com'
        ]
        # More strict email pattern - domain must have proper TLD
        self.email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$'
        
        # Common valid TLDs
        self.valid_tlds = [
            'com', 'org', 'net', 'edu', 'gov', 'io', 'co', 'ai', 'app', 'dev',
            'me', 'us', 'uk', 'de', 'fr', 'jp', 'cn', 'in', 'au', 'ca', 'br',
            'info', 'biz', 'tech', 'online', 'store', 'xyz', 'site', 'club'
        ]
    
    def is_valid_format(self, email):
        """Check if email has valid format using regex"""
        if not email or not isinstance(email, str):
            return False
        
        email = email.strip().lower()
        
        # Basic regex check
        if not re.match(self.email_pattern, email):
            return False
        
        # Check domain has valid structure (no consecutive dots, proper TLD)
        try:
            local, domain = email.rsplit('@', 1)
            
            # Domain must have at least one dot
            if '.' not in domain:
                return False
            
            # Get TLD (last part after dot)
            tld = domain.split('.')[-1]
            
            # TLD must be 2-10 characters
            if len(tld) < 2 or len(tld) > 10:
                return False
            
            # TLD must be all letters and max 6 chars (common TLDs are short)
            if not tld.isalpha():
                return False
            
            if len(tld) > 6:
                return False
            
            return True
        except:
            return False
    
    def has_mx_record(self, email):
        """Check if domain has MX records (real email server)"""
        try:
            domain = email.split('@')[1]
            dns.resolver.resolve(domain, 'MX', lifetime=5)
            return True
        except Exception as e:
            logger.debug(f"MX lookup failed for {email}: {e}")
            return False
    
    def is_disposable(self, email):
        """Check if email is from disposable provider"""
        try:
            domain = email.split('@')[1].lower()
            return domain in self.disposable_domains
        except:
            return False
    
    def is_role_based(self, email):
        """Check if email is role-based (not a person)"""
        role_accounts = [
            'info@', 'admin@', 'support@', 'sales@', 'contact@',
            'hello@', 'noreply@', 'no-reply@', 'webmaster@', 'help@',
            'privacy@', 'security@', 'abuse@', 'postmaster@'
        ]
        email_lower = email.lower()
        return any(email_lower.startswith(role) for role in role_accounts)
    
    def validate(self, email, strict=False):
        """Comprehensive email validation
        
        Args:
            email: Email address to validate
            strict: If True, require MX record check (slower but more accurate)
        """
        if not self.is_valid_format(email):
            return False, "Invalid format"
        
        if self.is_disposable(email):
            return False, "Disposable email"
        
        # Skip role-based check by default to collect more emails
        # Uncomment if you want to filter them out:
        # if self.is_role_based(email):
        #     return False, "Role-based email"
        
        # Only do MX check if strict mode is on (it's slow)
        if strict:
            if not self.has_mx_record(email):
                return False, "No MX record"
        
        return True, "Valid"
    
    def validate_batch(self, emails):
        """Validate a batch of emails"""
        results = []
        for email in emails:
            is_valid, reason = self.validate(email)
            results.append({
                'email': email,
                'is_valid': is_valid,
                'reason': reason
            })
        return results