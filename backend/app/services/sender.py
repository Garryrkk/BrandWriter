import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_email(to_email: str, subject: str = None, body: str = None):
    """
    Send email using SMTP (Gmail) or SendGrid
    Falls back to SMTP if SendGrid API key is not configured
    """
    subject = subject or settings.SUBJECT
    body = body or settings.BODY
    
    # Try SendGrid first if API key is configured
    if settings.SENDGRID_API_KEY:
        try:
            from sendgrid import SendGridAPIClient
            from sendgrid.helpers.mail import Mail
            
            message = Mail(
                from_email=settings.FROM_EMAIL,
                to_emails=to_email,
                subject=subject,
                html_content=body
            )
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            response = sg.send(message)
            return {"status": "sent", "provider": "sendgrid", "status_code": response.status_code}
        except Exception as e:
            print(f"SendGrid failed: {e}, falling back to SMTP")
    
    # Fall back to SMTP
    if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.FROM_EMAIL
            msg['To'] = to_email
            
            html_part = MIMEText(body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_USE_TLS:
                    server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.FROM_EMAIL, to_email, msg.as_string())
            
            return {"status": "sent", "provider": "smtp"}
        except Exception as e:
            return {"status": "failed", "error": str(e)}
    
    return {"status": "failed", "error": "No email provider configured"}


async def send_email_async(to_email: str, subject: str = None, body: str = None):
    """Async wrapper for send_email"""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, send_email, to_email, subject, body)