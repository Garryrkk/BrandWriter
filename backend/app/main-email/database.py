import sqlite3
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path='emails.db'):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS emails (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                company TEXT,
                source_url TEXT,
                interests TEXT,
                is_verified BOOLEAN DEFAULT 0,
                is_sent BOOLEAN DEFAULT 0,
                sent_date DATETIME,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS campaigns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                subject TEXT,
                body TEXT,
                sent_count INTEGER DEFAULT 0,
                created_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("✓ Database initialized")
    
    def add_email(self, email_data):
        """Add new email to database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO emails (email, name, company, source_url, interests, is_verified)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                email_data.get('email'),
                email_data.get('name'),
                email_data.get('company'),
                email_data.get('source_url'),
                json.dumps(email_data.get('interests', [])),
                email_data.get('is_verified', False)
            ))
            conn.commit()
            return True
        except sqlite3.IntegrityError:
            return False  # Email already exists
        finally:
            conn.close()
    
    def get_all_emails(self):
        """Get all emails from database"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM emails ORDER BY created_date DESC')
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def get_email_by_id(self, email_id):
        """Get email by ID"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM emails WHERE id = ?', (email_id,))
        row = cursor.fetchone()
        conn.close()
        
        return dict(row) if row else None
    
    def delete_email(self, email_id):
        """Delete email by ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM emails WHERE id = ?', (email_id,))
        conn.commit()
        conn.close()
    
    def mark_as_verified(self, email):
        """Mark email as verified"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('UPDATE emails SET is_verified = 1 WHERE email = ?', (email,))
        conn.commit()
        conn.close()
    
    def get_unsent_emails(self, limit=50):
        """Get emails that haven't been sent yet"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM emails 
            WHERE is_sent = 0 AND is_verified = 1
            LIMIT ?
        ''', (limit,))
        
        results = cursor.fetchall()
        conn.close()
        
        return results
    
    def mark_as_sent(self, email):
        """Mark email as sent"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE emails 
            SET is_sent = 1, sent_date = ?
            WHERE email = ?
        ''', (datetime.now(), email))
        
        conn.commit()
        conn.close()
    
    def get_stats(self):
        """Get database statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM emails')
        total = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM emails WHERE is_verified = 1')
        verified = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM emails WHERE is_sent = 1')
        sent = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM emails WHERE is_sent = 0 AND is_verified = 1')
        pending = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'totalEmails': total,
            'verified': verified,
            'sent': sent,
            'pending': pending
        }