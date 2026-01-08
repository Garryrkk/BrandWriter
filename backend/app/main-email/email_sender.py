import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import logging

class EmailSender:
    def __init__(self, gmail_address, app_password):
        self.gmail_address = gmail_address
        self.app_password = app_password
        self.smtp_server = 'smtp.gmail.com'
        self.smtp_port = 587
    
    def send_email(self, to_email, subject, body, personalization=None):
        """Send a single email"""
        try:
            # Personalize the email
            if personalization:
                for key, value in personalization.items():
                    body = body.replace(f"{{{{{key}}}}}", str(value))
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.gmail_address
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add body
            msg.attach(MIMEText(body, 'plain'))
            
            # Connect and send
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.gmail_address, self.app_password)
            server.send_message(msg)
            server.quit()
            
            logging.info(f"Email sent to {to_email}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to send to {to_email}: {e}")
            return False
    
    def send_campaign(self, emails, subject, body, delay=2):
        """Send email campaign with rate limiting"""
        sent_count = 0
        failed_count = 0
        
        for email_data in emails:
            personalization = {
                'email': email_data.get('email'),
                'name': email_data.get('name', 'there'),
                'company': email_data.get('company', 'your company')
            }
            
            if self.send_email(email_data['email'], subject, body, personalization):
                sent_count += 1
            else:
                failed_count += 1
            
            time.sleep(delay)  # Rate limiting
        
        return sent_count, failed_count