"""
Email sending module with campaign management
Handles automated email sending with rate limiting, progress tracking, and logging
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import (
    Email, SendLog, Campaign, DomainCooldown, SendBatch,
    EmailStatus, SendStatus, CampaignStatus
)
import time
import os


class EmailSender:
    """Handles email sending with SMTP"""
    
    def __init__(
        self,
        smtp_server: str = None,
        smtp_port: int = None,
        smtp_user: str = None,
        smtp_password: str = None
    ):
        self.smtp_server = smtp_server or os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = smtp_port or int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = smtp_user or os.getenv("SMTP_USER")
        self.smtp_password = smtp_password or os.getenv("SMTP_PASSWORD")
        
    def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        from_email: str,
        from_name: str = None
    ) -> Dict[str, any]:
        """
        Send a single email via SMTP
        Returns dict with success status and error message if any
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{from_name} <{from_email}>" if from_name else from_email
            msg['To'] = to_email
            
            # Add body (support both plain text and HTML)
            if '<html>' in body.lower() or '<body>' in body.lower():
                msg.attach(MIMEText(body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))
            
            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            return {
                'success': True,
                'error': None,
                'sent_at': datetime.utcnow()
            }
            
        except smtplib.SMTPRecipientsRefused as e:
            return {
                'success': False,
                'error': f"Recipient refused: {str(e)}",
                'sent_at': None,
                'status': SendStatus.BOUNCED
            }
        except smtplib.SMTPAuthenticationError as e:
            return {
                'success': False,
                'error': f"SMTP authentication failed: {str(e)}",
                'sent_at': None,
                'status': SendStatus.FAILED
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'sent_at': None,
                'status': SendStatus.FAILED
            }


class CampaignManager:
    """Manages email campaigns with status tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_campaign(
        self,
        name: str,
        subject: str,
        body: str,
        from_email: str,
        from_name: str = None,
        daily_limit: int = 100
    ) -> Campaign:
        """Create a new campaign"""
        campaign = Campaign(
            name=name,
            subject=subject,
            body=body,
            from_email=from_email,
            from_name=from_name,
            daily_limit=daily_limit,
            status=CampaignStatus.DRAFT
        )
        self.db.add(campaign)
        self.db.commit()
        self.db.refresh(campaign)
        return campaign
    
    def start_campaign(self, campaign_id: int) -> bool:
        """Start a campaign (change status to active)"""
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign and campaign.status == CampaignStatus.DRAFT:
            campaign.status = CampaignStatus.ACTIVE
            self.db.commit()
            return True
        return False
    
    def pause_campaign(self, campaign_id: int) -> bool:
        """Pause a campaign"""
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign and campaign.status == CampaignStatus.ACTIVE:
            campaign.status = CampaignStatus.PAUSED
            self.db.commit()
            return True
        return False
    
    def resume_campaign(self, campaign_id: int) -> bool:
        """Resume a paused campaign"""
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if campaign and campaign.status == CampaignStatus.PAUSED:
            campaign.status = CampaignStatus.ACTIVE
            self.db.commit()
            return True
        return False
    
    def get_campaign_stats(self, campaign_id: int) -> Dict:
        """Get campaign statistics"""
        campaign = self.db.query(Campaign).filter(Campaign.id == campaign_id).first()
        if not campaign:
            return None
        
        return {
            'id': campaign.id,
            'name': campaign.name,
            'status': campaign.status,
            'total_queued': campaign.total_queued,
            'total_sent': campaign.total_sent,
            'total_failed': campaign.total_failed,
            'total_bounced': campaign.total_bounced,
            'last_run_at': campaign.last_run_at,
            'next_run_at': campaign.next_run_at
        }


class EmailCampaignSender:
    """Manages email campaigns with rate limiting and cooldowns"""
    
    def __init__(self, db: Session):
        self.db = db
        self.sender = EmailSender()
        self.campaign_manager = CampaignManager(db)
    
    def check_domain_cooldown(self, domain: str, cooldown_days: int = 7) -> bool:
        """
        Check if domain is in cooldown period
        Returns True if domain can be contacted, False if in cooldown
        """
        cooldown = self.db.query(DomainCooldown).filter(
            DomainCooldown.domain == domain
        ).first()
        
        if not cooldown:
            return True
        
        cooldown_until = cooldown.last_contacted + timedelta(days=cooldown_days)
        return datetime.utcnow() > cooldown_until
    
    def update_domain_cooldown(self, domain: str):
        """Update domain cooldown timestamp"""
        cooldown = self.db.query(DomainCooldown).filter(
            DomainCooldown.domain == domain
        ).first()
        
        if cooldown:
            cooldown.last_contacted = datetime.utcnow()
            cooldown.contact_count += 1
        else:
            cooldown = DomainCooldown(
                domain=domain,
                last_contacted=datetime.utcnow(),
                contact_count=1
            )
            self.db.add(cooldown)
        
        self.db.commit()
    
    def get_eligible_emails(
        self,
        campaign_id: int,
        limit: int = 100
    ) -> List[Email]:
        """
        Get emails eligible for sending
        - Status = 'queued'
        - Not sent in this campaign before
        - Domain not in cooldown
        - Respects daily limit
        """
        # Get emails in queued status
        queued_emails = self.db.query(Email).filter(
            Email.status == EmailStatus.QUEUED,
            Email.is_validated == True
        ).limit(limit * 2).all()
        
        eligible = []
        domains_contacted = set()
        
        for email in queued_emails:
            if len(eligible) >= limit:
                break
            
            # Check if already sent in this campaign
            already_sent = self.db.query(SendLog).filter(
                SendLog.email_id == email.id,
                SendLog.campaign_id == campaign_id
            ).first()
            
            if already_sent:
                continue
            
            # Check domain cooldown
            domain = email.email_address.split('@')[1]
            
            # Skip if we already contacted this domain in this batch
            if domain in domains_contacted:
                continue
            
            if not self.check_domain_cooldown(domain):
                continue
            
            eligible.append(email)
            domains_contacted.add(domain)
        
        return eligible[:limit]
    
    def _personalize_email(self, template: str, email_record: Email) -> str:
        """
        Simple email personalization with variable substitution
        Supports: {{name}}, {{company}}, {{role}}
        """
        personalized = template
        
        if email_record.person_name:
            first_name = email_record.person_name.split()[0]
            personalized = personalized.replace('{{name}}', first_name)
            personalized = personalized.replace('{{full_name}}', email_record.person_name)
        
        if email_record.role:
            personalized = personalized.replace('{{role}}', email_record.role)
        
        if email_record.company:
            personalized = personalized.replace('{{company}}', email_record.company.name)
        
        return personalized
    
    def send_campaign_batch(
        self,
        campaign_id: int,
        daily_limit: int = 100,
        delay_seconds: float = 2.0
    ) -> Dict[str, any]:
        """
        Send a batch of emails for a campaign with progress tracking
        Returns stats: sent, failed, skipped
        """
        campaign = self.db.query(Campaign).filter(
            Campaign.id == campaign_id
        ).first()
        
        if not campaign:
            return {'error': 'Campaign not found'}
        
        if campaign.status != CampaignStatus.ACTIVE:
            return {'error': 'Campaign is not active'}
        
        # Create send batch
        send_batch = SendBatch(
            campaign_id=campaign_id,
            status='pending'
        )
        self.db.add(send_batch)
        self.db.commit()
        self.db.refresh(send_batch)
        
        # Get eligible emails
        eligible_emails = self.get_eligible_emails(campaign_id, daily_limit)
        
        send_batch.total_emails = len(eligible_emails)
        send_batch.status = 'running'
        send_batch.started_at = datetime.utcnow()
        self.db.commit()
        
        stats = {
            'batch_id': send_batch.id,
            'sent': 0,
            'failed': 0,
            'bounced': 0,
            'total': len(eligible_emails)
        }
        
        for idx, email_record in enumerate(eligible_emails):
            # Update batch progress
            send_batch.current_email_index = idx
            send_batch.progress_percentage = int((idx / len(eligible_emails)) * 100)
            self.db.commit()
            
            # Personalize email body
            personalized_body = self._personalize_email(
                campaign.body,
                email_record
            )
            
            # Send email
            result = self.sender.send_email(
                to_email=email_record.email_address,
                subject=campaign.subject,
                body=personalized_body,
                from_email=campaign.from_email,
                from_name=campaign.from_name
            )
            
            # Determine status
            if result['success']:
                send_status = SendStatus.SENT
                stats['sent'] += 1
                # Update domain cooldown
                domain = email_record.email_address.split('@')[1]
                self.update_domain_cooldown(domain)
            elif result.get('status') == SendStatus.BOUNCED:
                send_status = SendStatus.BOUNCED
                stats['bounced'] += 1
            else:
                send_status = SendStatus.FAILED
                stats['failed'] += 1
            
            # Log the send attempt
            send_log = SendLog(
                email_id=email_record.id,
                campaign_id=campaign_id,
                batch_id=send_batch.id,
                sent_at=result['sent_at'] or datetime.utcnow(),
                status=send_status,
                error_message=result['error'],
                subject_sent=campaign.subject,
                body_preview=personalized_body[:500]
            )
            self.db.add(send_log)
            
            # Rate limiting delay
            time.sleep(delay_seconds)
        
        # Update send batch
        send_batch.status = 'completed'
        send_batch.completed_at = datetime.utcnow()
        send_batch.sent_count = stats['sent']
        send_batch.failed_count = stats['failed'] + stats['bounced']
        send_batch.progress_percentage = 100
        
        # Update campaign stats
        campaign.total_sent += stats['sent']
        campaign.total_failed += stats['failed']
        campaign.total_bounced += stats['bounced']
        campaign.last_run_at = datetime.utcnow()
        
        self.db.commit()
        
        return stats
    
    def finalize_send_run(self):
        """
        Reset queued emails back to draft after send run
        This allows emails to be re-queued for future sends
        """
        queued_emails = self.db.query(Email).filter(
            Email.status == EmailStatus.QUEUED
        ).all()
        
        for email in queued_emails:
            email.status = EmailStatus.DRAFT
        
        self.db.commit()
        
        return len(queued_emails)
    
    def get_batch_status(self, batch_id: int) -> Optional[Dict]:
        """Get send batch status and progress"""
        batch = self.db.query(SendBatch).filter(SendBatch.id == batch_id).first()
        if not batch:
            return None
        
        return {
            'id': batch.id,
            'campaign_id': batch.campaign_id,
            'status': batch.status,
            'total_emails': batch.total_emails,
            'sent_count': batch.sent_count,
            'failed_count': batch.failed_count,
            'progress_percentage': batch.progress_percentage,
            'current_email_index': batch.current_email_index,
            'started_at': batch.started_at,
            'completed_at': batch.completed_at
        }


def start_campaign(db: Session, campaign_id: int) -> bool:
    """Start a campaign"""
    manager = CampaignManager(db)
    return manager.start_campaign(campaign_id)


def send_campaign_now(db: Session, campaign_id: int, daily_limit: int = 100) -> Dict:
    """
    Send campaign immediately
    Main function to trigger email sending
    """
    sender = EmailCampaignSender(db)
    return sender.send_campaign_batch(campaign_id, daily_limit)


def get_send_batch_status(db: Session, batch_id: int) -> Optional[Dict]:
    """Get status of a send batch"""
    sender = EmailCampaignSender(db)
    return sender.get_batch_status(batch_id)


def finalize_campaign_run(db: Session):
    """Reset queued emails to draft after campaign run"""
    sender = EmailCampaignSender(db)
    return sender.finalize_send_run()