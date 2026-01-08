import React, { useState, useEffect } from 'react';
import { Mail, Search, Send, Settings, Database, AlertCircle, CheckCircle, Clock, Users, Eye, Trash2, Download, RefreshCw } from 'lucide-react';

const EmailOutreachSystem = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [interests, setInterests] = useState(['AI', 'Tech']);
  const [newInterest, setNewInterest] = useState('');
  const [emailsPerDay, setEmailsPerDay] = useState(100);
  const [sendLimit, setSendLimit] = useState(50);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [gmailConfig, setGmailConfig] = useState({ email: '', appPassword: '' });
  const [collectedEmails, setCollectedEmails] = useState([]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    verified: 0,
    sent: 0,
    pending: 0
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Email backend runs separately on port 5000, proxied through /email-api
  const API_URL = '/email-api';

  // Check API connection on mount - only load data if connected
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      checkApiConnection();
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const checkApiConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/health`);
      if (response.ok) {
        setApiConnected(true);
        addLog('Connected to backend API', 'success');
        // Only load data after confirming connection
        loadStats();
        loadEmails();
      } else {
        setApiConnected(false);
        addLog('Email backend not responding. Start: python api.py (in backend/app/main-email)', 'error');
      }
    } catch (error) {
      setApiConnected(false);
      addLog('Email backend not running. Start: python api.py (in backend/app/main-email)', 'error');
    }
  };

  const loadStats = async () => {
    if (!apiConnected) return;
    try {
      const response = await fetch(`${API_URL}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      // Silently fail if backend not connected
    }
  };

  const loadEmails = async () => {
    if (!apiConnected) return;
    try {
      const response = await fetch(`${API_URL}/emails`);
      if (response.ok) {
        const data = await response.json();
        setCollectedEmails(data);
      }
    } catch (error) {
      // Silently fail if backend not connected
    }
  };

  const addInterest = () => {
    if (newInterest && !interests.includes(newInterest)) {
      setInterests([...interests, newInterest]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, type }, ...prev.slice(0, 99)]);
  };

  const startRealScan = async () => {
    if (!apiConnected) {
      addLog('Please start the backend server first!', 'error');
      return;
    }

    setIsScanning(true);
    addLog('Starting real email collection...', 'info');

    try {
      const response = await fetch(`${API_URL}/start-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: interests,
          target_count: emailsPerDay
        })
      });

      const data = await response.json();

      if (data.status === 'scanning_started') {
        addLog('Scan started successfully!', 'success');

        // Poll for updates every 5 seconds
        const pollInterval = setInterval(async () => {
          await loadStats();
          await loadEmails();

          if (!isScanning) {
            clearInterval(pollInterval);
          }
        }, 5000);

        // Stop scanning after completion
        setTimeout(() => {
          setIsScanning(false);
          addLog('Scan completed!', 'success');
        }, 60000); // Stop after 1 minute for demo
      }
    } catch (error) {
      addLog(`Scan failed: ${error.message}`, 'error');
      setIsScanning(false);
    }
  };

  const startRealSend = async () => {
    if (!apiConnected) {
      addLog('Please start the backend server first!', 'error');
      return;
    }

    if (!gmailConfig.email || !gmailConfig.appPassword) {
      addLog('Please configure Gmail credentials in Settings', 'error');
      return;
    }

    if (!emailTemplate) {
      addLog('Please create an email template first', 'error');
      return;
    }

    setIsSending(true);
    addLog('Starting email campaign...', 'info');

    try {
      const response = await fetch(`${API_URL}/send-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Your Subject Here',
          body: emailTemplate,
          limit: sendLimit,
          gmail: gmailConfig.email,
          app_password: gmailConfig.appPassword
        })
      });

      const data = await response.json();

      if (data.status === 'campaign_started') {
        addLog('Email campaign started!', 'success');

        // Poll for updates
        const pollInterval = setInterval(async () => {
          await loadStats();

          if (!isSending) {
            clearInterval(pollInterval);
          }
        }, 3000);

        setTimeout(() => {
          setIsSending(false);
          addLog('Campaign completed!', 'success');
        }, sendLimit * 2000);
      }
    } catch (error) {
      addLog(`Campaign failed: ${error.message}`, 'error');
      setIsSending(false);
    }
  };

  const deleteEmail = async (emailId) => {
    try {
      await fetch(`${API_URL}/emails/${emailId}`, { method: 'DELETE' });
      await loadEmails();
      await loadStats();
      addLog('Email deleted', 'success');
    } catch (error) {
      addLog('Failed to delete email', 'error');
    }
  };

  const verifyEmail = async (emailId) => {
    try {
      const response = await fetch(`${API_URL}/verify-email/${emailId}`, {
        method: 'POST'
      });
      const data = await response.json();
      addLog(`Verification: ${data.message}`, data.is_valid ? 'success' : 'error');
      await loadEmails();
      await loadStats();
    } catch (error) {
      addLog('Failed to verify email', 'error');
    }
  };

  const exportEmails = () => {
    const csv = [
      ['Email', 'Name', 'Company', 'Source', 'Verified', 'Sent'],
      ...collectedEmails.map(e => [
        e.email, e.name || '', e.company || '', e.source_url || '',
        e.is_verified ? 'Yes' : 'No', e.is_sent ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'collected_emails.csv';
    a.click();
  };

  const sendTestEmail = async () => {
    if (!apiConnected) {
      addLog('Please start the backend server first!', 'error');
      return;
    }
    if (!gmailConfig.email || !gmailConfig.appPassword) {
      addLog('Please configure Gmail credentials in Settings', 'error');
      return;
    }
    if (!emailTemplate) {
      addLog('Please create an email template first', 'error');
      return;
    }
    if (!recipientEmail) {
      addLog('Please enter a recipient email address', 'error');
      return;
    }

    setIsSending(true);
    addLog(`Sending email to ${recipientEmail}...`, 'info');

    try {
      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          gmail_email: gmailConfig.email,
          gmail_password: gmailConfig.appPassword,
          subject: 'Email from BrandWriter',
          body: emailTemplate
        })
      });

      const data = await response.json();
      if (response.ok) {
        addLog(`✅ Email sent successfully to ${recipientEmail}!`, 'success');
      } else {
        addLog(`❌ Failed to send: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
        {/* Connection Status Banner */}
        {!apiConnected && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-medium">Backend Not Connected</span>
                <span className="text-red-400">- Run: python api.py</span>
              </div>
              <button
                onClick={checkApiConnection}
                className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 flex items-center space-x-1 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700/50 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Mail className="w-8 h-8 text-yellow-300" />
              <div>
                <h1 className="text-2xl font-bold text-white">Email Outreach Automation</h1>
                <p className="text-slate-400">Intelligent contact discovery & outreach system</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={startRealScan}
                disabled={isScanning || !apiConnected}
                className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-slate-900 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 disabled:bg-slate-600 disabled:text-slate-400 flex items-center space-x-2 font-semibold transition-all"
              >
                <Search className="w-4 h-4" />
                <span>{isScanning ? 'Scanning...' : 'Start Scan'}</span>
              </button>
              <button
                onClick={startRealSend}
                disabled={isSending || stats.pending === 0 || !apiConnected}
                className="bg-gradient-to-r from-pink-200 to-pink-300 text-slate-900 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 disabled:bg-slate-600 disabled:text-slate-400 flex items-center space-x-2 font-semibold transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Sending...' : 'Send Emails'}</span>
              </button>
              <button
                onClick={exportEmails}
                disabled={collectedEmails.length === 0}
                className="bg-slate-700/50 hover:bg-slate-700 text-white px-4 py-2 rounded-lg disabled:bg-slate-800 disabled:text-slate-600 flex items-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Collected</p>
                <p className="text-3xl font-bold text-yellow-300">{stats.totalEmails}</p>
              </div>
              <Database className="w-12 h-12 text-yellow-300/20" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400/20" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Sent Today</p>
                <p className="text-3xl font-bold text-pink-300">{stats.sent}</p>
              </div>
              <Send className="w-12 h-12 text-pink-300/20" />
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-3xl font-bold text-orange-400">{stats.pending}</p>
              </div>
              <Clock className="w-12 h-12 text-orange-400/20" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-slate-700/50 mb-6">
          <div className="flex border-b border-slate-700/50">
            {['dashboard', 'emails', 'interests', 'template', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-all ${
                  activeTab === tab
                    ? 'border-b-2 border-yellow-300 text-yellow-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Activity Log</h2>
                <div className="bg-slate-900/50 rounded-lg p-4 h-96 overflow-y-auto border border-slate-700/50">
                  {logs.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No activity yet. Start scanning to see logs.</p>
                  ) : (
                    logs.map((log, idx) => (
                      <div key={idx} className="mb-2 flex items-start space-x-2">
                        <span className="text-xs text-slate-500 whitespace-nowrap">{log.timestamp}</span>
                        <span className={`text-sm ${
                          log.type === 'success' ? 'text-green-400' :
                          log.type === 'error' ? 'text-red-400' :
                          'text-slate-300'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Emails Tab */}
            {activeTab === 'emails' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Collected Emails</h2>
                  <button
                    onClick={loadEmails}
                    className="bg-yellow-300 text-slate-900 px-3 py-1 rounded hover:bg-yellow-400 flex items-center space-x-1 font-semibold transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                {collectedEmails.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No emails collected yet. Start scanning!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Company</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Source</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                        {collectedEmails.map((email, idx) => (
                          <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-4 py-3 text-sm text-white">{email.email}</td>
                            <td className="px-4 py-3 text-sm text-slate-300">{email.name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-slate-300">{email.company || '-'}</td>
                            <td className="px-4 py-3 text-sm text-yellow-300 truncate max-w-xs">
                              <a href={email.source_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {email.source_url ? new URL(email.source_url).hostname : '-'}
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                {email.is_verified ? (
                                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">✓ Verified</span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30">Unverified</span>
                                )}
                                {email.is_sent && (
                                  <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded border border-pink-500/30">Sent</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                {!email.is_verified && (
                                  <button
                                    onClick={() => verifyEmail(email.id)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                    title="Verify"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteEmail(email.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Interests Tab */}
            {activeTab === 'interests' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Target Interests</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Add New Interest
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      placeholder="e.g., Machine Learning, SaaS, Startups"
                      className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white placeholder-slate-400"
                    />
                    <button
                      onClick={addInterest}
                      className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-slate-900 px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 font-semibold transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map(interest => (
                    <span
                      key={interest}
                      className="bg-yellow-300/20 text-yellow-300 px-4 py-2 rounded-full flex items-center space-x-2 border border-yellow-300/30"
                    >
                      <span>{interest}</span>
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-yellow-300 hover:text-red-400 text-xl transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-300">
                        The system will search for contacts interested in these topics across various platforms including company websites, professional networks, and public directories.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Template Tab */}
            {activeTab === 'template' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Email Template</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Send Limit per Day
                  </label>
                  <input
                    type="number"
                    value={sendLimit}
                    onChange={(e) => setSendLimit(parseInt(e.target.value))}
                    min="1"
                    max="500"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">Gmail limit: 500 emails/day (regular), 2000/day (Workspace)</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Content
                  </label>
                  <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    placeholder={`Hi {{name}},

I noticed your interest in {{interest}} and thought you might be interested in...

Variables available: {{name}}, {{email}}, {{interest}}, {{company}}`}
                    rows="12"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none font-mono text-sm text-white placeholder-slate-400"
                  />
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-300 font-medium">Legal Compliance Required</p>
                      <p className="text-sm text-yellow-400 mt-1">
                        • Include unsubscribe link in every email<br />
                        • Add your physical address<br />
                        • Ensure CAN-SPAM Act compliance<br />
                        • Only contact people who expect your email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold mb-4 text-white">Configuration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Emails to Collect per Day
                    </label>
                    <input
                      type="number"
                      value={emailsPerDay}
                      onChange={(e) => setEmailsPerDay(parseInt(e.target.value))}
                      min="1"
                      max="1000"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Gmail Address
                    </label>
                    <input
                      type="email"
                      value={gmailConfig.email}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, email: e.target.value })}
                      placeholder="your-email@gmail.com"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Gmail App Password
                    </label>
                    <input
                      type="password"
                      value={gmailConfig.appPassword}
                      onChange={(e) => setGmailConfig({ ...gmailConfig, appPassword: e.target.value })}
                      placeholder="16-character app password"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Generate at: Google Account → Security → 2-Step Verification → App passwords
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Recipient Email Address
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="recipient@example.com"
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg focus:ring-2 focus:ring-yellow-300 focus:outline-none text-white placeholder-slate-400"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      The email address where you want to send the test email
                    </p>
                  </div>
                </div>
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <button
                    onClick={sendTestEmail}
                    disabled={isSending || !apiConnected}
                    className={`w-full px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
                      isSending || !apiConnected
                        ? 'bg-blue-500/30 text-blue-300 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>{isSending ? 'Sending Email...' : `Send Email to ${recipientEmail || 'recipient'}`}</span>
                  </button>
                  <p className="text-xs text-blue-300 mt-2">
                    Sends an email using your Gmail account to the recipient address
                  </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-300 font-medium">Important Security Notice</p>
                      <p className="text-sm text-red-400 mt-1">
                        This is a UI demonstration. In production:<br />
                        • Never store credentials in browser<br />
                        • Use OAuth 2.0 authentication<br />
                        • Store sensitive data server-side<br />
                        • Implement proper encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default EmailOutreachSystem;