import React, { useState, useEffect } from 'react';
import { Search, Users, FileText, Clock, Send, Activity, Settings, Eye, Plus, X, Trash2, ArrowRight, CheckCircle, AlertCircle, Loader, Play, Pause, RefreshCw, Menu, ChevronDown, Filter } from 'lucide-react';

// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// API Service
const api = {
  healthCheck: async () => {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  createCompany: async (data) => {
    const res = await fetch(`${API_BASE_URL}/companies/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  listCompanies: async (skip = 0, limit = 100) => {
    const res = await fetch(`${API_BASE_URL}/companies/?skip=${skip}&limit=${limit}`);
    return res.json();
  },

  getCompany: async (companyId) => {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}`);
    return res.json();
  },

  scanCompany: async (companyId, params = {}) => {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scan_website: params.scan_website ?? true,
        scan_linkedin: params.scan_linkedin ?? false,
        max_pages: params.max_pages ?? 5,
        verify_emails: params.verify_emails ?? true
      })
    });
    return res.json();
  },

  getScanStatus: async (scanJobId) => {
    const res = await fetch(`${API_BASE_URL}/scans/${scanJobId}/status`);
    return res.json();
  },

  getCompanyScans: async (companyId, limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/scans/company/${companyId}?limit=${limit}`);
    return res.json();
  },

  listPeople: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.company_id) query.append('company_id', params.company_id);
    if (params.skip) query.append('skip', params.skip);
    if (params.limit) query.append('limit', params.limit);
    const res = await fetch(`${API_BASE_URL}/people/?${query}`);
    return res.json();
  },

  getPerson: async (personId) => {
    const res = await fetch(`${API_BASE_URL}/people/${personId}`);
    return res.json();
  },

  listEmails: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.verification_status) query.append('verification_status', params.verification_status);
    if (params.company_id) query.append('company_id', params.company_id);
    if (params.skip) query.append('skip', params.skip);
    if (params.limit) query.append('limit', params.limit);
    const res = await fetch(`${API_BASE_URL}/emails/?${query}`);
    return res.json();
  },

  queueEmails: async (emailIds) => {
    const res = await fetch(`${API_BASE_URL}/emails/queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_ids: emailIds })
    });
    return res.json();
  },

  updateEmailStatus: async (emailId, status) => {
    const res = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  verifyEmail: async (emailId, checkSmtp = false) => {
    const res = await fetch(`${API_BASE_URL}/emails/verify/${emailId}?check_smtp=${checkSmtp}`, {
      method: 'POST'
    });
    return res.json();
  },

  verifyBulkEmails: async (emailIds, checkMx = true, checkSmtp = false) => {
    const res = await fetch(`${API_BASE_URL}/emails/verify/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_ids: emailIds,
        check_mx: checkMx,
        check_smtp: checkSmtp
      })
    });
    return res.json();
  },

  getVerificationJob: async (jobId) => {
    const res = await fetch(`${API_BASE_URL}/emails/verify/job/${jobId}`);
    return res.json();
  },

  createCampaign: async (data) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  listCampaigns: async () => {
    const res = await fetch(`${API_BASE_URL}/campaigns/`);
    return res.json();
  },

  getCampaign: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}`);
    return res.json();
  },

  startCampaign: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/start`, {
      method: 'POST'
    });
    return res.json();
  },

  pauseCampaign: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/pause`, {
      method: 'POST'
    });
    return res.json();
  },

  resumeCampaign: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/resume`, {
      method: 'POST'
    });
    return res.json();
  },

  sendCampaign: async (campaignId, dailyLimit = 100) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        daily_limit: dailyLimit
      })
    });
    return res.json();
  },

  getCampaignStats: async (campaignId) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/stats`);
    return res.json();
  },

  getCampaignBatches: async (campaignId, limit = 10) => {
    const res = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/batches?limit=${limit}`);
    return res.json();
  },

  getOverviewStats: async () => {
    const res = await fetch(`${API_BASE_URL}/stats/overview`);
    return res.json();
  },

  resetQueue: async () => {
    const res = await fetch(`${API_BASE_URL}/utils/reset-queue`, {
      method: 'POST'
    });
    return res.json();
  }
};

const App = () => {
  const [activeScreen, setActiveScreen] = useState('companies');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile menu only
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [currentScanJobId, setCurrentScanJobId] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle, running, completed, failed
  const [people, setPeople] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [queue, setQueue] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [stats, setStats] = useState(null);
  const [scans, setScans] = useState([]);
  const [currentScanResults, setCurrentScanResults] = useState([]);
  const [verificationJob, setVerificationJob] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Scan form states
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDomain, setNewCompanyDomain] = useState('');
  const [scanWebsite, setScanWebsite] = useState(true);
  const [scanLinkedin, setScanLinkedin] = useState(false);
  const [maxPages, setMaxPages] = useState(5);

  // Filter states
  const [roleFilter, setRoleFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [excludeLowConfidence, setExcludeLowConfidence] = useState(false);

  // Campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    body: '',
    from_email: '',
    from_name: '',
    daily_limit: 100
  });

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await api.healthCheck();
      setApiStatus('connected');
      loadInitialData();
    } catch (error) {
      setApiStatus('disconnected');
      console.error('API connection failed:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      const [companiesData, statsData, campaignsData] = await Promise.all([
        api.listCompanies(),
        api.getOverviewStats(),
        api.listCampaigns()
      ]);
      setCompanies(companiesData);
      setStats(statsData);
      setCampaigns(campaignsData);
      
      if (companiesData.length > 0) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

const handleCreateCompany = async () => {
    if (!newCompanyName || !newCompanyDomain) {
      alert('Please enter company name and domain');
      return;
    }

    try {
      const companyData = await api.createCompany({
        name: newCompanyName,
        domain: newCompanyDomain,
        website: `https://${newCompanyDomain}`
      });

      setCompanies([...companies, companyData]);
      setSelectedCompanyId(companyData.id);
      setNewCompanyName('');
      setNewCompanyDomain('');
      alert('Company added successfully! You can now scan it.');
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Error creating company. It may already exist. Try selecting it from the dropdown instead.');
    }
  };

const startScan = async () => {
  if (!selectedCompanyId) {
    alert('Please select a company first');
    return;
  }

  try {
    setScanState('running');
    setScanProgress({
      percentage: 0,
      currentStep: 'Initializing scan...',
      pagesScanned: 0,
      peopleFound: 0,
      emailsDiscovered: 0
    });

    setScanProgress({
      percentage: 5,
      currentStep: 'Starting scan...',
      pagesScanned: 0,
      peopleFound: 0,
      emailsDiscovered: 0
    });

    const scanResult = await api.scanCompany(selectedCompanyId, {
      scan_website: scanWebsite,
      scan_linkedin: scanLinkedin,
      max_pages: maxPages,
      verify_emails: true
    });

    if (scanResult.scan_job_id) {
      setCurrentScanJobId(scanResult.scan_job_id);
      pollScanStatus(scanResult.scan_job_id);
    } else {
      pollScanStatus(selectedCompanyId);
    }
  } catch (error) {
    console.error('Error starting scan:', error);
    setScanState('failed');
    setError(error.message || 'Failed to start scan');
  }
};

  const pollScanStatus = async (scanJobIdOrCompanyId) => {
    let scanJobId = scanJobIdOrCompanyId;

    if (!currentScanJobId) {
      try {
        const scansData = await api.getCompanyScans(selectedCompanyId, 1);
        if (scansData.length > 0) {
          scanJobId = scansData[0].id;
          setCurrentScanJobId(scanJobId);
        }
      } catch (error) {
        console.error('Error getting scan job ID:', error);
      }
    }

    const interval = setInterval(async () => {
      try {
        const status = await api.getScanStatus(scanJobId);

        setScanProgress({
          percentage: status.progress_percentage || 0,
          currentStep: status.status || 'scanning',
          pagesScanned: Math.floor((status.progress_percentage || 0) / 10),
          peopleFound: status.people_found || 0,
          emailsDiscovered: status.emails_found || 0
        });

        if (status.status === 'completed') {
          clearInterval(interval);
          setScanState('completed');
          await loadScanResults(selectedCompanyId, scanJobId);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          setScanState('failed');
          setError('Scan failed. Please try again.');
        }
      } catch (error) {
        console.error('Error polling scan status:', error);
      }
    }, 2500);
  };

  const loadScanResults = async (companyId, scanJobId) => {
    try {
      const emailsData = await api.listEmails({ 
        company_id: companyId,
        status: 'draft'
      });
      setCurrentScanResults(emailsData);
      await loadDrafts();
      await loadPeople();
      await loadScans();
    } catch (error) {
      console.error('Error loading scan results:', error);
    }
  };

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const emailsData = await api.listEmails({ status: 'draft' });
      setDrafts(emailsData);
      setError(null);
    } catch (error) {
      console.error('Error loading drafts:', error);
      setError('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const loadQueue = async () => {
    setLoading(true);
    try {
      const emailsData = await api.listEmails({ status: 'queued' });
      setQueue(emailsData);
      setError(null);
    } catch (error) {
      console.error('Error loading queue:', error);
      setError('Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async () => {
    try {
      const peopleData = await api.listPeople();
      setPeople(peopleData);
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadScans = async () => {
    try {
      const companiesData = await api.listCompanies();
      const allScans = [];
      
      for (const company of companiesData) {
        const companyScans = await api.getCompanyScans(company.id);
        allScans.push(...companyScans.map(s => ({ ...s, company })));
      }
      
      setScans(allScans);
    } catch (error) {
      console.error('Error loading scans:', error);
    }
  };

  const queueSelectedEmails = async () => {
    if (selectedEmails.length === 0) {
      alert('Please select emails to queue');
      return;
    }

    try {
      const result = await api.queueEmails(selectedEmails);
      alert(`Queued ${result.queued} emails`);
      setSelectedEmails([]);
      await loadDrafts();
      await loadQueue();
    } catch (error) {
      console.error('Error queueing emails:', error);
      alert('Error queueing emails');
    }
  };

  const verifyBulkEmails = async () => {
    if (selectedEmails.length === 0) {
      alert('Please select emails to verify');
      return;
    }

    try {
      const result = await api.verifyBulkEmails(selectedEmails, true, false);
      setVerificationJob(result);
      
      const interval = setInterval(async () => {
        try {
          const jobStatus = await api.getVerificationJob(result.job_id);
          setVerificationJob(jobStatus);
          
          if (jobStatus.status === 'completed') {
            clearInterval(interval);
            alert('Verification complete!');
            await loadDrafts();
            await loadScanResults(selectedCompanyId, currentScanJobId);
          }
        } catch (error) {
          console.error('Error polling verification:', error);
        }
      }, 2000);
    } catch (error) {
      console.error('Error verifying emails:', error);
      alert('Error verifying emails');
    }
  };

  const createNewCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.from_email) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await api.createCampaign(campaignForm);
      alert('Campaign created successfully!');
      setCampaignForm({
        name: '',
        subject: '',
        body: '',
        from_email: '',
        from_name: '',
        daily_limit: 100
      });
      
      const campaignsData = await api.listCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Error creating campaign');
    }
  };

  const handleStartCampaign = async (campaignId) => {
    try {
      await api.startCampaign(campaignId);
      alert('Campaign started!');
      const campaignsData = await api.listCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error starting campaign:', error);
      alert('Error starting campaign');
    }
  };

  const handlePauseCampaign = async (campaignId) => {
    try {
      await api.pauseCampaign(campaignId);
      alert('Campaign paused!');
      const campaignsData = await api.listCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error pausing campaign:', error);
      alert('Error pausing campaign');
    }
  };

  const handleResumeCampaign = async (campaignId) => {
    try {
      await api.resumeCampaign(campaignId);
      alert('Campaign resumed!');
      const campaignsData = await api.listCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error resuming campaign:', error);
      alert('Error resuming campaign');
    }
  };

  const handleSendCampaign = async (campaignId) => {
    if (!window.confirm('Send campaign batch now?')) return;

    try {
      await api.sendCampaign(campaignId, 100);
      alert('Campaign batch started sending!');
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Error sending campaign');
    }
  };

  useEffect(() => {
    if (activeScreen === 'drafts') loadDrafts();
    if (activeScreen === 'queue') loadQueue();
    if (activeScreen === 'campaigns') api.listCampaigns().then(setCampaigns);
    if (activeScreen === 'history') loadScans();
    if (activeScreen === 'people') loadPeople();
  }, [activeScreen]);

  const getConfidenceBadge = (score) => {
    if (typeof score === 'number') {
      if (score >= 0.7) return { label: 'High', color: 'bg-green-100 text-green-800 border-green-300' };
      if (score >= 0.4) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      return { label: 'Low', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    return { label: score || 'Unknown', color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  const ConfidenceBadge = ({ confidence, verificationStatus }) => {
    let badge;
    if (verificationStatus) {
      if (verificationStatus === 'valid') badge = { label: 'Valid', color: 'bg-green-100 text-green-800 border-green-300' };
      else if (verificationStatus === 'risky') badge = { label: 'Risky', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      else badge = { label: 'Invalid', color: 'bg-red-100 text-red-800 border-red-300' };
    } else {
      badge = getConfidenceBadge(confidence);
    }

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const NavItem = ({ icon: Icon, label, screen, badge }) => (
    <button
      onClick={() => {
        setActiveScreen(screen);
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        activeScreen === screen
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  const PersonDetailDrawer = ({ person, onClose }) => {
    if (!person) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={onClose}>
        <div className="bg-white w-full max-w-md h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Person Details</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <h4 className="font-semibold text-xl">{person.full_name || person.name}</h4>
              <p className="text-gray-600 mt-1">{person.role}</p>
            </div>

            {person.emails && person.emails.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700">Emails</label>
                {person.emails.map(email => (
                  <div key={email.id} className="mt-2 flex items-center justify-between">
                    <p className="text-gray-900">{email.email_address}</p>
                    <ConfidenceBadge verificationStatus={email.verification_status} />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Role Confidence</label>
              <div className="mt-2">
                <div className="text-2xl font-bold text-blue-600">
                  {person.role_confidence ? `${Math.round(person.role_confidence * 100)}%` : 'N/A'}
                </div>
              </div>
            </div>

            {person.source_page && (
              <div>
                <label className="text-sm font-medium text-gray-700">Source</label>
                <p className="mt-1 text-gray-900">{person.source_page}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filterResults = (results) => {
    return results.filter(email => {
      if (roleFilter !== 'all' && email.person?.role !== roleFilter) return false;
      
      if (email.person?.role_confidence) {
        if (email.person.role_confidence < confidenceFilter) return false;
      }
      
      if (verifiedOnly && email.verification_status !== 'valid') return false;
      
      if (excludeLowConfidence) {
        const badge = getConfidenceBadge(email.person?.role_confidence);
        if (badge.label === 'Low') return false;
      }
      
      return true;
    });
  };

  
  return (
  <div className="min-h-screen bg-gray-50">
    {/* Top Navbar */}
    <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold text-gray-900">BrandWriter</h1>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveScreen('companies')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeScreen === 'companies' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Companies
            </button>
            <button
              onClick={() => setActiveScreen('emails')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeScreen === 'emails' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Emails
            </button>
            <button
              onClick={() => setActiveScreen('campaigns')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeScreen === 'campaigns' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveScreen('scans')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeScreen === 'scans' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Scans
            </button>
            <button
              onClick={() => setActiveScreen('settings')}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeScreen === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-1 rounded ${apiStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {apiStatus === 'connected' ? '● Connected' : '● Disconnected'}
          </span>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>

    <div className="pt-16">

{/* COMPANIES SCREEN */}
{activeScreen === 'companies' && (
  <div className="max-w-6xl mx-auto p-8">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Companies</h2>
        <p className="text-gray-600 mt-1">Manage your target companies</p>
      </div>
      <button
        onClick={() => setActiveScreen('addCompany')}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <Plus size={16} />
        Add Company
      </button>
    </div>

    <div className="bg-white rounded-lg shadow-sm border">
      {companies.length === 0 ? (
        <div className="p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
          <p className="text-gray-600 mb-6">Add your first company to start discovering decision-makers</p>
          <button
            onClick={() => setActiveScreen('addCompany')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {companies.map((company) => (
            <div key={company.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">{company.name}</h3>
              <p className="text-sm text-gray-600 mb-1">{company.domain}</p>
              <p className="text-sm text-gray-500 mb-4">{company.website}</p>
              
              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <div>Last Scan: {company.last_scan_at ? new Date(company.last_scan_at).toLocaleDateString() : '—'}</div>
                <div>Emails Found: {company.total_emails || 0}</div>
              </div>

              <button
                onClick={async () => {
                  setSelectedCompanyId(company.id);
                  await startScan();
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
              >
                SCAN COMPANY
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{/* ADD COMPANY SCREEN */}
{activeScreen === 'addCompany' && (
  <div className="max-w-2xl mx-auto p-8">
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Add New Company</h2>
      <p className="text-gray-600 mt-1">Enter company details to add to your list</p>
    </div>

    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
          <input
            type="text"
            value={newCompanyName}
            onChange={(e) => setNewCompanyName(e.target.value)}
            placeholder="Acme Inc"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Domain *</label>
          <input
            type="text"
            value={newCompanyDomain}
            onChange={(e) => setNewCompanyDomain(e.target.value)}
            placeholder="acme.com"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={async () => {
              await handleCreateCompany();
              setActiveScreen('companies');
            }}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Add Company
          </button>
          <button
            onClick={() => {
              setNewCompanyName('');
              setNewCompanyDomain('');
              setActiveScreen('companies');
            }}
            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

        {/* SCAN SCREEN */}
        {activeScreen === 'scans' && (

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Scan for Decision-Makers
              </h2>
              <p className="text-gray-600">
                Discover real people at companies who make decisions
              </p>
           

            {/* Scan Options */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">2. Scan Options</h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={scanWebsite}
                    onChange={(e) => setScanWebsite(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-700">Scan Website</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={scanLinkedin}
                    onChange={(e) => setScanLinkedin(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-gray-700">Scan LinkedIn</span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Pages: {maxPages}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={maxPages}
                    onChange={(e) => setMaxPages(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Scan Button */}
{/* Scan Button */}
<button
  onClick={startScan}
  disabled={(!selectedCompanyId && (!newCompanyName || !newCompanyDomain)) || scanState === 'running' || apiStatus !== 'connected'}
  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
>
  {scanState === 'running' ? (
    <>
      <Loader className="animate-spin" size={24} />
      SCANNING...
    </>
  ) : (
    <>
      {!selectedCompanyId && newCompanyName && newCompanyDomain ? 
        'CREATE COMPANY & SCAN' : 
        'SCAN'
      }
    </>
  )}
</button>

<p className="text-xs text-center text-gray-500 mt-2">
  {!selectedCompanyId && newCompanyName && newCompanyDomain ? 
    'This will create the company and immediately scan it' :
    selectedCompanyId ? 
    'Scan the selected company for decision-makers' :
    'Select a company or enter a new one to begin'
  }
</p>

            {/* Scan Progress */}
            {scanState === 'running' && scanProgress && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{scanProgress.currentStep}</span>
                    <span>{scanProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${scanProgress.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{scanProgress.pagesScanned}</div>
                    <div className="text-sm text-gray-600">Pages scanned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{scanProgress.peopleFound}</div>
                    <div className="text-sm text-gray-600">People found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{scanProgress.emailsDiscovered}</div>
                    <div className="text-sm text-gray-600">Emails discovered</div>
                  </div>
                </div>
              </div>
            )}

            {/* Scan Results */}
            {scanState === 'completed' && currentScanResults.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Scan Results ({filterResults(currentScanResults).length})</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedEmails(currentScanResults.map(r => r.id));
                        queueSelectedEmails();
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Queue All
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="p-4 border-b bg-gray-50 space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Role</label>
                      <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded"
                      >
                        <option value="all">All Roles</option>
                        <option value="CTO">CTO</option>
                        <option value="VP Engineering">VP Engineering</option>
                        <option value="Head of Product">Head of Product</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-gray-600 block mb-1">Min Confidence: {confidenceFilter}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={confidenceFilter}
                        onChange={(e) => setConfidenceFilter(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={verifiedOnly}
                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Verified only</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={excludeLowConfidence}
                        onChange={(e) => setExcludeLowConfidence(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Exclude low confidence</span>
                    </label>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="w-12 px-6 py-3">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedEmails.length === filterResults(currentScanResults).length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedEmails(filterResults(currentScanResults).map(r => r.id));
                              } else {
                                setSelectedEmails([]);
                              }
                            }}
                          />
                        </th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Confidence</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filterResults(currentScanResults).map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedEmails.includes(email.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmails([...selectedEmails, email.id]);
                                } else {
                                  setSelectedEmails(selectedEmails.filter(id => id !== email.id));
                                }
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{email.email_address}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{email.person?.full_name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{email.person?.role || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <ConfidenceBadge 
                              confidence={email.person?.role_confidence} 
                              verificationStatus={email.verification_status} 
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={async () => {
                                await api.queueEmails([email.id]);
                                alert('Email queued!');
                                loadQueue();
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Queue
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State - No Results */}
            {scanState === 'completed' && currentScanResults.length === 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-12 text-center">
                <AlertCircle className="mx-auto text-yellow-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No decision-maker emails discovered for this scan
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting the scan settings or selecting a different company
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setScanState('idle')}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Refine Scan
                  </button>
                  <button
                    onClick={startScan}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {scanState === 'failed' && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border p-12 text-center">
                <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Scan Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  {error || 'An error occurred during scanning. Please try again.'}
                </p>
                <button
                  onClick={() => {
                    setScanState('idle');
                    setError(null);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Retry Scan
                </button>
              </div>
            )}

            {/* Idle State */}
            {scanState === 'idle' && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-4">How this works</h3>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">1.</span>
                    <span>We scan public pages on the company website</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">2.</span>
                    <span>Identify real people mentioned on those pages</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">3.</span>
                    <span>Filter for decision-maker roles and titles</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">4.</span>
                    <span>Discover and validate email addresses</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-semibold text-blue-600">5.</span>
                    <span>Save results for your review before contact</span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* SCAN HISTORY SCREEN */}
        {activeScreen === 'history' && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Scan History</h2>
                <p className="text-gray-600 mt-1">All previous scans and results</p>
              </div>
              <button
                onClick={loadScans}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              {scans.length === 0 ? (
                <div className="p-12 text-center">
                  <Activity className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No scans yet</h3>
                  <p className="text-gray-600 mb-6">Start your first scan to discover decision-makers</p>
                  <button
                    onClick={() => setActiveScreen('scans')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start New Scan
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">People</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Emails</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {scans.map((scan) => (
                        <tr key={scan.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{scan.company?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {scan.started_at ? new Date(scan.started_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{scan.people_found || 0}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{scan.emails_found || 0}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              scan.status === 'completed' ? 'bg-green-100 text-green-800 border-green-300' :
                              scan.status === 'failed' ? 'bg-red-100 text-red-800 border-red-300' :
                              'bg-yellow-100 text-yellow-800 border-yellow-300'
                            }`}>
                              {scan.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EMAILS SCREEN */}
{activeScreen === 'emails' && (
  <div className="max-w-6xl mx-auto p-8">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Emails</h2>
        <p className="text-gray-600 mt-1">Browse all discovered emails</p>
      </div>
      <button
        onClick={async () => {
          const allEmails = await api.listEmails();
          setDrafts(allEmails);
        }}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <RefreshCw size={16} />
        Refresh
      </button>
    </div>

    <div className="bg-white rounded-lg shadow-sm border">
      {drafts.length === 0 ? (
        <div className="p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
          <p className="text-gray-600 mb-6">Run a scan to discover emails</p>
          <button
            onClick={() => setActiveScreen('companies')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Companies
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Last Sent</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drafts.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{email.email_address}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{email.person?.full_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{email.person?.role || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{email.company || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <ConfidenceBadge 
                      confidence={email.person?.role_confidence} 
                      verificationStatus={email.verification_status} 
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">Never</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await api.queueEmails([email.id]);
                          alert('Email queued!');
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        title="Queue"
                      >
                        ➕
                      </button>
                      <button
                        onClick={() => {
                          setDrafts(drafts.filter(d => d.id !== email.id));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Remove"
                      >
                        ❌
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
  </div>
)}

        {/* PEOPLE SCREEN */}
        {activeScreen === 'people' && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">People</h2>
                <p className="text-gray-600 mt-1">All discovered decision-makers</p>
              </div>
              <button
                onClick={loadPeople}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              {people.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No people discovered yet</h3>
                  <p className="text-gray-600 mb-6">Run a scan to discover decision-makers</p>
                  <button
                    onClick={() => setActiveScreen('scans')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start New Scan
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Confidence</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Emails</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {people.map((person) => (
                        <tr key={person.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{person.full_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{person.role || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{person.company || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {person.role_confidence ? `${Math.round(person.role_confidence * 100)}%` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{person.email_count || 0}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={async () => {
                                try {
                                  const fullPerson = await api.getPerson(person.id);
                                  setSelectedPerson(fullPerson);
                                } catch (error) {
                                  console.error('Error loading person:', error);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DRAFTS SCREEN */}
        {activeScreen === 'drafts' && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Drafts</h2>
              <p className="text-gray-600 mt-1">Review and queue emails for sending</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              {drafts.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts yet</h3>
                  <p className="text-gray-600 mb-6">Run a scan to discover emails</p>
                  <button
                    onClick={() => setActiveScreen('scans')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Start New Scan
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="text-sm text-gray-600">{drafts.length} emails ({selectedEmails.length} selected)</div>
                    <div className="flex gap-2">
                      <button
                        onClick={verifyBulkEmails}
                        disabled={selectedEmails.length === 0}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Verify Selected
                      </button>
                      <button
                        onClick={queueSelectedEmails}
                        disabled={selectedEmails.length === 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Queue Selected
                      </button>
                    </div>
                  </div>

                  {verificationJob && verificationJob.status !== 'completed' && (
                    <div className="p-4 bg-blue-50 border-b">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader className="animate-spin" size={16} />
                        <span className="text-sm font-medium">Verifying emails...</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${verificationJob.progress_percentage || 0}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {verificationJob.verified_count || 0} / {verificationJob.total_emails} verified
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="w-12 px-6 py-3">
                            <input
                              type="checkbox"
                              className="rounded"
                              checked={selectedEmails.length === drafts.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEmails(drafts.map(d => d.id));
                                } else {
                                  setSelectedEmails([]);
                                }
                              }}
                            />
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Person</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quality</th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {drafts.map((email) => (
                          <tr key={email.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={selectedEmails.includes(email.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedEmails([...selectedEmails, email.id]);
                                  } else {
                                    setSelectedEmails(selectedEmails.filter(id => id !== email.id));
                                  }
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {email.person?.full_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{email.person?.role || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{email.email_address}</td>
                            <td className="px-6 py-4">
                              <ConfidenceBadge verificationStatus={email.verification_status} />
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => email.person && setSelectedPerson(email.person)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* QUEUE SCREEN */}
        {activeScreen === 'queue' && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Queue</h2>
              <p className="text-gray-600 mt-1">Emails ready to send</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{queue.length}</div>
                  <div className="text-sm text-gray-600 mt-1">Emails queued</div>
                </div>
                <button
                  onClick={async () => {
                    const activeCampaign = campaigns.find(c => c.status === 'active');
                    
                    if (!activeCampaign) {
                      alert('No active campaign found. Please create and activate a campaign first.');
                      setActiveScreen('campaigns');
                      return;
                    }
                    
                    if (window.confirm(`Send ${queue.length} queued emails via "${activeCampaign.name}"?`)) {
                      try {
                        await api.sendCampaign(activeCampaign.id, queue.length);
                        alert('Campaign batch started sending!');
                        await loadQueue();
                      } catch (error) {
                        console.error('Error sending campaign:', error);
                        alert('Error sending campaign');
                      }
                    }
                  }}
                  disabled={queue.length === 0}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  SEND TODAY
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border">
              {queue.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Queue is empty</h3>
                  <p className="text-gray-600 mb-6">Add emails from drafts to queue them for sending</p>
                  <button
                    onClick={() => setActiveScreen('drafts')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Go to Drafts
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Person</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {queue.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {email.person?.full_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{email.email_address}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{email.company || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 border border-green-300">
                              Queued
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={async () => {
                                try {
                                  await api.updateEmailStatus(email.id, 'draft');
                                  await loadQueue();
                                  await loadDrafts();
                                } catch (error) {
                                  console.error('Error removing from queue:', error);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMPAIGNS SCREEN */}
        {activeScreen === 'campaigns' && (
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
              <p className="text-gray-600 mt-1">Message templates and campaign management</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border mb-6">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Active Campaigns</h3>
              </div>
              {campaigns.length === 0 ? (
                <div className="p-6 text-center text-gray-600">No campaigns yet. Create one below.</div>
              ) : (
                <div className="divide-y">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Sent: {campaign.total_sent || 0}</span>
                            <span>Failed: {campaign.total_failed || 0}</span>
                            <span>Status: {campaign.status}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleStartCampaign(campaign.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Start Campaign"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          {campaign.status === 'active' && (
                            <>
                              <button
                                onClick={() => handlePauseCampaign(campaign.id)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                                title="Pause Campaign"
                              >
                                <Pause size={16} />
                              </button>
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                title="Send Now"
                              >
                                <Send size={16} />
                              </button>
                            </>
                          )}
                          {campaign.status === 'paused' && (
                            <button
                              onClick={() => handleResumeCampaign(campaign.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                              title="Resume Campaign"
                            >
                              <Play size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Create New Campaign</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    placeholder="My Campaign"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                    <input
                      type="text"
                      value={campaignForm.from_name}
                      onChange={(e) => setCampaignForm({...campaignForm, from_name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                    <input
                      type="email"
                      value={campaignForm.from_email}
                      onChange={(e) => setCampaignForm({...campaignForm, from_email: e.target.value})}
                      placeholder="john@yourcompany.com"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                    placeholder="Quick question for {name}"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                  <textarea
                    rows={8}
                    value={campaignForm.body}
                    onChange={(e) => setCampaignForm({...campaignForm, body: e.target.value})}
                    placeholder="Hi {name},

I noticed you're the {role} at {company}. I wanted to reach out because..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Available variables: {'{name}'}, {'{company}'}, {'{role}'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Send Limit</label>
                  <input
                    type="number"
                    value={campaignForm.daily_limit}
                    onChange={(e) => setCampaignForm({...campaignForm, daily_limit: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={createNewCampaign}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Create Campaign
                  </button>
                  <button
                    onClick={() => setCampaignForm({
                      name: '',
                      subject: '',
                      body: '',
                      from_email: '',
                      from_name: '',
                      daily_limit: 100
                    })}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS SCREEN */}
        {activeScreen === 'settings' && (
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Configure sending limits and preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
                    <input
                      type="text"
                      value={API_BASE_URL}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Current API endpoint: {apiStatus === 'connected' ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>

                  <button
                    onClick={checkApiHealth}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
                  >
                    Test Connection
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">Utilities</h3>
                <button
                  onClick={async () => {
                    if (window.confirm('Reset all queued emails to draft status?')) {
                      try {
                        const result = await api.resetQueue();
                        alert(`Reset ${result.emails_reset} emails`);
                        await loadQueue();
                        await loadDrafts();
                      } catch (error) {
                        console.error('Error resetting queue:', error);
                        alert('Error resetting queue');
                      }
                    }
                  }}
                  className="bg-yellow-600 text-white py-2 px-6 rounded-lg hover:bg-yellow-700"
                >
                  Reset Queue
                </button>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-semibold text-gray-900 mb-4">System Stats</h3>
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-2xl font-bold text-gray-900">{stats.companies}</div>
                      <div className="text-sm text-gray-600">Total Companies</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-2xl font-bold text-gray-900">{stats.people?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total People</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-2xl font-bold text-gray-900">{stats.emails?.total || 0}</div>
                      <div className="text-sm text-gray-600">Total Emails</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="text-2xl font-bold text-gray-900">{stats.total_sent || 0}</div>
                      <div className="text-sm text-gray-600">Total Sent</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

    {/* Loading Overlay */}
    {loading && (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <Loader className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )}

    {/* Person Detail Drawer */}
    {selectedPerson && (
      <PersonDetailDrawer
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    )}
  </div>
);
};

export default App;