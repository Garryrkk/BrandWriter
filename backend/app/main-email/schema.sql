-- PostgreSQL Database Schema for Email Outreach System
-- This file shows the database structure that will be created
-- Run this manually if you want to set up the database before running the app

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    website VARCHAR(500),
    linkedin VARCHAR(500),
    company_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    last_contacted TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_status ON companies(status);

-- People table
CREATE TABLE IF NOT EXISTS people (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    linkedin VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_people_company ON people(company_id);
CREATE INDEX idx_people_role ON people(role);

-- Emails table (persistent identity)
CREATE TABLE IF NOT EXISTS emails (
    id SERIAL PRIMARY KEY,
    email_address VARCHAR(255) UNIQUE NOT NULL,
    person_name VARCHAR(255),
    role VARCHAR(255),
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'deleted')),
    quality_score INTEGER DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_address ON emails(email_address);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_company ON emails(company_id);
CREATE INDEX idx_emails_quality ON emails(quality_score);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255),
    daily_limit INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Send logs table (immutable history)
CREATE TABLE IF NOT EXISTS send_logs (
    id SERIAL PRIMARY KEY,
    email_id INTEGER NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'failed')),
    error_message TEXT
);

CREATE INDEX idx_send_logs_email ON send_logs(email_id);
CREATE INDEX idx_send_logs_campaign ON send_logs(campaign_id);
CREATE INDEX idx_send_logs_status ON send_logs(status);
CREATE INDEX idx_send_logs_sent_at ON send_logs(sent_at);

-- Domain cooldowns table
CREATE TABLE IF NOT EXISTS domain_cooldowns (
    id SERIAL PRIMARY KEY,
    domain VARCHAR(255) UNIQUE NOT NULL,
    last_contacted TIMESTAMP NOT NULL,
    cooldown_days INTEGER DEFAULT 7,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_domain_cooldowns_domain ON domain_cooldowns(domain);
CREATE INDEX idx_domain_cooldowns_last_contacted ON domain_cooldowns(last_contacted);

-- Helpful views for analytics

-- View: Email send statistics per company
CREATE OR REPLACE VIEW company_send_stats AS
SELECT 
    c.id,
    c.name,
    c.domain,
    COUNT(DISTINCT e.id) as total_emails,
    COUNT(DISTINCT CASE WHEN e.status = 'draft' THEN e.id END) as draft_count,
    COUNT(DISTINCT CASE WHEN e.status = 'queued' THEN e.id END) as queued_count,
    COUNT(DISTINCT sl.id) as total_sent,
    COUNT(DISTINCT CASE WHEN sl.status = 'sent' THEN sl.id END) as successful_sends,
    COUNT(DISTINCT CASE WHEN sl.status = 'failed' THEN sl.id END) as failed_sends
FROM companies c
LEFT JOIN emails e ON c.id = e.company_id
LEFT JOIN send_logs sl ON e.id = sl.email_id
GROUP BY c.id, c.name, c.domain;

-- View: Campaign performance
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
    cp.id,
    cp.name,
    cp.status,
    COUNT(DISTINCT sl.id) as total_sends,
    COUNT(DISTINCT CASE WHEN sl.status = 'sent' THEN sl.id END) as successful_sends,
    COUNT(DISTINCT CASE WHEN sl.status = 'failed' THEN sl.id END) as failed_sends,
    ROUND(
        COUNT(DISTINCT CASE WHEN sl.status = 'sent' THEN sl.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT sl.id), 0) * 100, 2
    ) as success_rate,
    MIN(sl.sent_at) as first_send,
    MAX(sl.sent_at) as last_send
FROM campaigns cp
LEFT JOIN send_logs sl ON cp.id = sl.campaign_id
GROUP BY cp.id, cp.name, cp.status;

-- View: Daily send volume
CREATE OR REPLACE VIEW daily_send_volume AS
SELECT 
    DATE(sent_at) as send_date,
    COUNT(*) as total_sends,
    COUNT(CASE WHEN status = 'sent' THEN 1 END) as successful_sends,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_sends
FROM send_logs
GROUP BY DATE(sent_at)
ORDER BY send_date DESC;

-- Sample data for testing (optional)
-- Uncomment to insert sample data

/*
INSERT INTO companies (name, domain, website, company_type) VALUES
    ('Acme Corp', 'acme.com', 'https://acme.com', 'saas'),
    ('BuildTech', 'buildtech.io', 'https://buildtech.io', 'dev_tools'),
    ('DataFlow', 'dataflow.ai', 'https://dataflow.ai', 'platform');

INSERT INTO campaigns (name, subject, body, from_email, from_name) VALUES
    (
        'Product Launch Outreach',
        'Excited to share something with you',
        'Hi {{name}},

I wanted to reach out because I think {{company}} could benefit from what we''re building.

Would you be open to a quick chat?

Best,
John',
        'john@example.com',
        'John Smith'
    );
*/

-- Useful queries for monitoring

-- Check email status distribution
-- SELECT status, COUNT(*) FROM emails GROUP BY status;

-- Check today's send volume
-- SELECT COUNT(*) FROM send_logs WHERE DATE(sent_at) = CURRENT_DATE;

-- Find domains in cooldown
-- SELECT domain, last_contacted, 
--        last_contacted + INTERVAL '7 days' as cooldown_until
-- FROM domain_cooldowns
-- WHERE last_contacted + INTERVAL '7 days' > CURRENT_TIMESTAMP;

-- Find high-quality emails ready to queue
-- SELECT email_address, quality_score, role, status
-- FROM emails
-- WHERE status = 'draft' AND quality_score >= 70 AND is_validated = TRUE
-- ORDER BY quality_score DESC
-- LIMIT 100;