import React, { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Plus, Trash2, Eye, Check, AlertCircle, Search, Filter, Mail, BarChart } from 'lucide-react';

const API_BASE_URL = '/email-api';

export default function EmailApp() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEmails, setSelectedEmails] = useState(new Set());
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState(null);
  const [showConfirmSend, setShowConfirmSend] = useState(false);
  const [stats, setStats] = useState({ totalEmails: 0, verified: 0, sent: 0, pending: 0 });

  // Real data from API
  const [draftEmails, setDraftEmails] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [queuedEmails] = useState([
    { id: 6, email: 'emma.wilson@company6.com', company: 'Cloud Ventures', lastSent: '10 days ago', cooldown: false, status: 'eligible' },
    { id: 7, email: 'james.taylor@company7.com', company: 'Data Dynamics', lastSent: '2 days ago', cooldown: true, status: 'cooldown' },
    { id: 8, email: 'lisa.martin@company8.com', company: 'AI Research', lastSent: '8 days ago', cooldown: false, status: 'eligible' },
  ]);

  const [campaigns] = useState([
    { id: 1, name: 'Q1 Outreach', status: 'active', emailsSent: 245, created: '2025-01-10', from: 'noreply@company.com', subject: 'Exciting Partnership Opportunity' },
    { id: 2, name: 'Product Launch', status: 'draft', emailsSent: 0, created: '2025-01-12', from: 'sales@company.com', subject: 'Introducing Our New Solution' },
  ]);

  const [batches] = useState([
    { id: 'BATCH-001', campaign: 'Q1 Outreach', status: 'completed', progress: 100, sent: 83, failed: 0, started: '2025-01-13 10:30' },
    { id: 'BATCH-002', campaign: 'Q1 Outreach', status: 'sending', progress: 63, sent: 42, failed: 2, started: '2025-01-14 09:15' },
  ]);

  const [scanLoading, setScanLoading] = useState(false);

  const getQualityColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getQualityDot = (score) => {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    return '🔴';
  };

  const toggleEmailSelect = (id) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmails(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedEmails.size === draftEmails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(draftEmails.map(e => e.id)));
    }
  };

  const handleViewValidation = (email) => {
    setSelectedEmailDetail(email);
    setShowValidationModal(true);
  };

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
    fetchEmails();
    fetchCompanies();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchEmails = async () => {
    console.log('🔄 Fetching emails from:', `${API_BASE_URL}/emails/?limit=1000`);
    try {
      const response = await fetch(`${API_BASE_URL}/emails/?limit=1000`);
      console.log('📧 Emails response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Raw emails data:', data.length, 'emails');
        // Transform API data to match component's expected format
        const transformed = data.map(e => ({
          id: e.id,
          email: e.email_address,
          name: e.person_name || 'Unknown',
          role: e.role || 'N/A',
          company: e.company || 'Unknown',
          quality: e.quality_score || 0,
          lastSent: 'Never',
          status: e.status,
        }));
        console.log('📧 Transformed emails:', transformed.length);
        setDraftEmails(transformed);
      } else {
        console.error('📧 Emails fetch failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('📧 Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    console.log('🔄 Fetching companies from:', `${API_BASE_URL}/companies/`);
    try {
      const response = await fetch(`${API_BASE_URL}/companies/`);
      console.log('🏢 Companies response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🏢 Raw companies data:', data);
        const transformed = data.map(c => ({
          id: c.id,
          name: c.name,
          domain: c.domain,
          industry: c.company_type || 'N/A',
          emailsFound: c.email_count || 0,
          lastScan: c.last_scanned ? new Date(c.last_scanned).toLocaleDateString() : 'Never',
        }));
        console.log('🏢 Transformed companies:', transformed);
        setCompanies(transformed);
      } else {
        console.error('🏢 Companies fetch failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('🏢 Failed to fetch companies:', error);
    }
  };

  // Ensure we have a valid company to scan; create a placeholder if none exist
  const ensureCompanyId = useCallback(async (companyId) => {
    let candidateId = typeof companyId === 'number' ? companyId : undefined;

    try {
      if (candidateId) {
        const checkRes = await fetch(`${API_BASE_URL}/companies/${candidateId}`);
        if (checkRes.ok) {
          return candidateId;
        }
      }

      const existingRes = await fetch(`${API_BASE_URL}/companies/`);
      if (existingRes.ok) {
        const companies = await existingRes.json();
        if (Array.isArray(companies) && companies.length > 0) {
          return companies[0].id;
        }
      }

      const createRes = await fetch(`${API_BASE_URL}/companies/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Default Company',
          domain: 'example.com',
          website: 'https://example.com',
        }),
      });

      if (createRes.ok) {
        const created = await createRes.json();
        return created.id;
      }
    } catch (error) {
      console.error('Failed to ensure company exists:', error);
    }

    return 1;
  }, []);

  // Poll for scan completion
  const pollScanStatus = async (companyId, maxRetries = 15) => {
    for (let i = 0; i < maxRetries; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      try {
        const response = await fetch(`${API_BASE_URL}/scans/company/${companyId}`);
        if (response.ok) {
          const scans = await response.json();
          if (scans.length > 0) {
            const latestScan = scans[0];
            console.log(`Scan poll ${i + 1}: status=${latestScan.status}, progress=${latestScan.progress_percentage}%`);
            if (latestScan.status === 'COMPLETED' || latestScan.status === 'FAILED') {
              return latestScan;
            }
          }
        }
      } catch (error) {
        console.error('Error polling scan status:', error);
      }
    }
    return null;
  };

  const startScan = async (companyId = 1) => {
    console.log('=== START SCAN CLICKED ===', { companyId });
    const resolvedCompanyId = await ensureCompanyId(companyId);
    console.log('Resolved company ID:', resolvedCompanyId);
    setScanLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scans/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: resolvedCompanyId,
          scan_website: true,
          scan_linkedin: false,
          max_pages: 5,
          verify_emails: true,
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        console.error('Start scan failed:', response.status, message);
        alert(`Scan failed: ${response.status} - ${message}`);
        return;
      }
      const result = await response.json();
      console.log('Scan started for', result.company_name, '- polling for completion...');
      
      // Poll for scan completion
      const completedScan = await pollScanStatus(resolvedCompanyId);
      if (completedScan) {
        console.log('Scan completed:', completedScan);
        if (completedScan.emails_found > 0) {
          alert(`✅ Scan complete! Found ${completedScan.emails_found} emails (${completedScan.emails_valid} valid)`);
        } else {
          alert(`⚠️ Scan complete but no emails found. Most websites hide emails behind contact forms.`);
        }
      } else {
        console.log('Scan still running or timed out');
      }
      
      // Refresh all data after scan
      fetchStats();
      fetchEmails();
      fetchCompanies();
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert(`Error starting scan: ${error.message}`);
    } finally {
      setScanLoading(false);
    }
  };

  // NAVBAR NAVIGATION
  const Navbar = () => (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <Mail className="text-blue-400" size={28} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Email Outreach</h1>
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'companies', label: 'Companies', icon: '🏢' },
                { id: 'scans', label: 'Scans', icon: '🔍' },
                { id: 'drafts', label: 'Drafts', icon: '📧' },
                { id: 'queue', label: 'Queue', icon: '📤' },
                { id: 'campaigns', label: 'Campaigns', icon: '📋' },
                { id: 'batches', label: 'Batches', icon: '📊' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'settings', label: 'Settings', icon: '⚙️' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' 
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg">
              <BarChart className="text-green-400" size={18} />
              <span className="text-sm font-semibold text-gray-300">Sent Today:</span>
              <span className="text-lg font-bold text-green-400">{stats.sent || 37}</span>
              <span className="text-gray-500">/</span>
              <span className="text-lg font-bold text-white">100</span>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              U
            </div>
          </div>
        </div>
      </div>
    </nav>
  );

  // OVERVIEW DASHBOARD
  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Debug info */}
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
        <p><strong>Debug:</strong> Loading: {loading ? 'Yes' : 'No'} | Emails loaded: {draftEmails.length} | Companies: {companies.length}</p>
        <button onClick={() => { setLoading(true); fetchEmails(); fetchCompanies(); }} className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-xs">Force Refresh Data</button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Draft Emails</p>
          <p className="text-3xl font-bold mt-2">{draftEmails.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Queued Emails</p>
          <p className="text-3xl font-bold mt-2">{queuedEmails.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Sent Today</p>
          <p className="text-3xl font-bold mt-2">37</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium">Active Campaign</p>
          <p className="text-3xl font-bold mt-2">1</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-700 pb-3 border-b">
            <span className="text-green-600 mr-3">✓</span>
            Scan completed for example.com
            <span className="text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-700 pb-3 border-b">
            <span className="text-blue-600 mr-3">📧</span>
            Batch #12 sent (83/100)
            <span className="text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <span className="text-orange-600 mr-3">⚠</span>
            3 domains currently in cooldown
            <span className="text-gray-500 ml-auto">Now</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-900 text-sm"><strong>Tip:</strong> Your daily limit is 100. You've sent 37 today.</p>
      </div>
    </div>
  );

  // COMPANIES SCREEN
  const CompaniesScreen = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Companies</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Company Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Domain</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Industry</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Emails Found</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Last Scan</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-900">{company.name}</td>
                <td className="p-4 text-sm text-gray-700">{company.domain}</td>
                <td className="p-4 text-sm text-gray-700">{company.industry}</td>
                <td className="p-4 text-sm text-gray-700">{company.emailsFound}</td>
                <td className="p-4 text-sm text-gray-700">{company.lastScan}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startScan(company.id)} className="text-blue-600 hover:text-blue-900" title="Start Scan">
                      <Search size={18} />
                    </button>
                    <button className="text-green-600 hover:text-green-900" title="View Scan History">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // SCANS SCREEN
  const ScansScreen = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Scans</h2>
        <button
          onClick={() => startScan()}
          disabled={scanLoading}
          className={`px-4 py-2 rounded-lg text-white font-semibold ${scanLoading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {scanLoading ? 'Starting...' : 'Start Scan'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Scan ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Progress</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Current Step</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{scan.id}</td>
                <td className="p-4 text-sm text-gray-700">{scan.company}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${scan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {scan.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${scan.progress}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-700">{scan.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-700">{scan.currentStep}</td>
                <td className="p-4 text-sm text-gray-700">{scan.started}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // DRAFT EMAILS - CORE WORKFLOW
  const DraftEmailsScreen = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Draft Emails</h2>
          <p className="text-gray-500 text-sm mt-1">Total: {draftEmails.length} emails</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setLoading(true); fetchEmails(); }} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🔄 Refresh
          </button>
          {selectedEmails.size > 0 && (
            <>
              <button onClick={() => setShowQueueModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Plus size={18} /> Queue Selected ({selectedEmails.size})
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Trash2 size={18} /> Delete Selected
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">
                <input type="checkbox" checked={selectedEmails.size === draftEmails.length} onChange={toggleSelectAll} className="cursor-pointer" />
              </th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Quality</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Last Sent</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">Loading emails...</td>
              </tr>
            ) : draftEmails.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500">
                  No emails found. Start a scan from the Companies tab to collect emails.
                </td>
              </tr>
            ) : draftEmails.map((email) => (
              <tr key={email.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <input type="checkbox" checked={selectedEmails.has(email.id)} onChange={() => toggleEmailSelect(email.id)} className="cursor-pointer" />
                </td>
                <td className="p-4 text-sm font-medium text-gray-900">{email.email}</td>
                <td className="p-4 text-sm text-gray-700">{email.name}</td>
                <td className="p-4 text-sm text-gray-700">{email.role}</td>
                <td className="p-4 text-sm text-gray-700">{email.company}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getQualityColor(email.quality)}`}>
                    {getQualityDot(email.quality)} {email.quality}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">{email.lastSent}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => setShowQueueModal(true)} className="text-blue-600 hover:text-blue-900" title="Queue">
                      <Plus size={18} />
                    </button>
                    <button className="text-red-600 hover:text-red-900" title="Delete">
                      <Trash2 size={18} />
                    </button>
                    <button onClick={() => handleViewValidation(email)} className="text-green-600 hover:text-green-900" title="View Validation">
                      <Eye size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // SEND QUEUE
  const SendQueueScreen = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Send Queue</h2>
          <p className="text-gray-600 mt-1">Queued Emails: <span className="font-semibold">{queuedEmails.length}</span> | Eligible Today: <span className="font-semibold">58</span></p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Company</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Last Sent</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Cooldown Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {queuedEmails.map((email) => (
              <tr key={email.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-gray-900">{email.email}</td>
                <td className="p-4 text-sm text-gray-700">{email.company}</td>
                <td className="p-4 text-sm text-gray-700">{email.lastSent}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${email.cooldown ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {email.cooldown ? '🔴 In cooldown' : '🟢 Eligible'}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700 capitalize">{email.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={() => setShowConfirmSend(true)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
        SEND TODAY'S BATCH
      </button>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-blue-900 text-sm"><strong>Note:</strong> Sent emails automatically return to Drafts for reuse.</p>
      </div>
    </div>
  );

  // CAMPAIGNS
  const CampaignsScreen = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{campaign.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Created: {campaign.created}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {campaign.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-700 mb-4">
              <p><strong>From:</strong> {campaign.from}</p>
              <p><strong>Subject:</strong> {campaign.subject}</p>
              <p className="mt-2"><strong>Emails Sent:</strong> {campaign.emailsSent}</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                {campaign.status === 'draft' ? '▶ Start' : campaign.status === 'active' ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm">✏ Edit</button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">🧪 Test Email</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // SEND BATCHES
  const SendBatchesScreen = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Send Batches</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Batch ID</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Campaign</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Progress</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Sent</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Failed</th>
              <th className="p-4 text-left text-sm font-semibold text-gray-700">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {batches.map((batch) => (
              <tr key={batch.id} className="hover:bg-gray-50">
                <td className="p-4 text-sm font-medium text-blue-600 cursor-pointer hover:underline">{batch.id}</td>
                <td className="p-4 text-sm text-gray-700">{batch.campaign}</td>
                <td className="p-4">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${batch.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {batch.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${batch.progress}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-700">{batch.progress}%</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-700">{batch.sent}</td>
                <td className="p-4 text-sm text-red-600">{batch.failed}</td>
                <td className="p-4 text-sm text-gray-700">{batch.started}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ANALYTICS
  const AnalyticsScreen = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Emails Sent Per Day</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-20 text-sm">Mon</span>
              <div className="flex-1 bg-gray-200 h-6 rounded relative">
                <div className="bg-blue-600 h-6 rounded" style={{ width: '75%' }}></div>
              </div>
              <span className="w-12 text-right text-sm">75</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-sm">Tue</span>
              <div className="flex-1 bg-gray-200 h-6 rounded relative">
                <div className="bg-blue-600 h-6 rounded" style={{ width: '82%' }}></div>
              </div>
              <span className="w-12 text-right text-sm">82</span>
            </div>
            <div className="flex items-center">
              <span className="w-20 text-sm">Wed</span>
              <div className="flex-1 bg-gray-200 h-6 rounded relative">
                <div className="bg-blue-600 h-6 rounded" style={{ width: '68%' }}></div>
              </div>
              <span className="w-12 text-right text-sm">68</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Success vs Failure</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Successful</span>
              <div className="flex-1 ml-4 bg-gray-200 h-6 rounded" style={{ width: '200px' }}>
                <div className="bg-green-600 h-6 rounded" style={{ width: '92%' }}></div>
              </div>
              <span className="w-12 text-right text-sm">92%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Failed</span>
              <div className="flex-1 ml-4 bg-gray-200 h-6 rounded" style={{ width: '200px' }}>
                <div className="bg-red-600 h-6 rounded" style={{ width: '8%' }}></div>
              </div>
              <span className="w-12 text-right text-sm">8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // SETTINGS
  const SettingsScreen = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Send Limit</label>
            <input type="number" defaultValue="100" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default From Email</label>
            <input type="email" defaultValue="noreply@company.com" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">Save Changes</button>
        </div>
      </div>
    </div>
  );

  // MAIN CONTENT ROUTER
  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewDashboard />;
      case 'companies': return <CompaniesScreen />;
      case 'scans': return <ScansScreen />;
      case 'drafts': return <DraftEmailsScreen />;
      case 'queue': return <SendQueueScreen />;
      case 'campaigns': return <CampaignsScreen />;
      case 'batches': return <SendBatchesScreen />;
      case 'analytics': return <AnalyticsScreen />;
      case 'settings': return <SettingsScreen />;
      default: return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-7xl mx-auto p-8">
        {renderContent()}
      </main>
      
      {/* Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Queue Emails</h2>
            <p className="text-gray-600 mb-6">You are about to queue <strong>{selectedEmails.size || 1}</strong> email{selectedEmails.size !== 1 ? 's' : ''} for sending.</p>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-6 text-sm text-blue-900">
              <strong>Note:</strong> These emails will be sent according to your daily limit and campaign schedule.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowQueueModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                Cancel
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                Queue Emails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && selectedEmailDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Email Validation Details</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold">{selectedEmailDetail.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">MX Records</p>
                  <p className="text-lg font-semibold text-green-700">✓ Valid</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600">SMTP Check</p>
                  <p className="text-lg font-semibold text-green-700">✓ Verified</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600">Role Confidence</p>
                  <p className="text-lg font-semibold text-blue-700">95%</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-gray-500">
                  <p className="text-sm text-gray-600">Disposable Check</p>
                  <p className="text-lg font-semibold text-gray-700">✓ Not Disposable</p>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600">Quality Score</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
                    <div className="bg-yellow-500 h-4" style={{ width: '78%' }}></div>
                  </div>
                  <span className="text-lg font-semibold text-yellow-700">78</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowValidationModal(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                Close
              </button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                Queue This Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Send Modal */}
      {showConfirmSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle size={28} className="text-orange-600" />
              <h2 className="text-xl font-bold">Confirm Send</h2>
            </div>
            <p className="text-gray-600 mb-6">You are about to send <strong>58 emails</strong> today. This action cannot be undone.</p>
            <div className="bg-orange-50 border border-orange-200 p-3 rounded mb-6 text-sm text-orange-900">
              <strong>⚠ Warning:</strong> Make sure your campaign is configured correctly before sending.
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmSend(false)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg">
                Cancel
              </button>
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
