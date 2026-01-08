import { useState } from 'react';
import { 
  Linkedin, Instagram, Youtube, Mail, 
  MessageSquare, Clock, Zap, Target,
  Bot, Sparkles, TrendingUp, BookOpen, Send, FileText
} from 'lucide-react';

// ============ LAYOUT IMPORTS ============
import { Sidebar, Topbar } from './components/layout';

// ============ PAGE IMPORTS ============
import BasketPage from './pages/basket';
import DraftsPage from './pages/drafts';
import HistoryPage from './pages/history';
import SchedulerPage from './pages/schedule';
import TemplatesPage from './pages/templates';
import BrandVoicePage from './pages/brand_voice';
import QuickGenShortcutsPage from './pages/generator';

import GenerateLinkedIn from './generate/linkedin';
import GenerateInstagram from './generate/instagram';
import GenerateYouTube from './generate/youtube';
import GenerateMedium from './generate/medium';

import LeadDashboard from './linkedin/lead-discovery';
import EmailOutreachSystem from './main-email/email';

import DashboardV2 from './components/DashboardV2';

// ============ DASHBOARD COMPONENT ============
const Dashboard = ({ setCurrentPage }) => {
  const stats = {
    linkedin: { generated: 12, scheduled: 3, published: 1, quota: 88 },
    instagram: { generated: 20, scheduled: 5, published: 3, quota: 80 },
    youtube: { generated: 3, scheduled: 2, published: 1, quota: 97 },
    medium: { generated: 8, scheduled: 2, published: 1, quota: 92 },
    email: { coldEmails: 100, coldDMs: 100, status: 'Completed' }
  };

  const autoGenFeed = [
    { id: 1, type: 'linkedin', time: '2 mins ago', preview: '5 biggest mistakes founders make when pitching investors…' },
    { id: 2, type: 'email', time: '5 mins ago', preview: 'Subject: Quick question about scaling your growth' },
    { id: 3, type: 'reel', time: '8 mins ago', preview: 'Hook: "If you\'re struggling with reach in 2025..."' }
  ];

  const todaySchedule = [
    { time: '9:00 AM', platform: 'LinkedIn', content: 'Thought leadership post' },
    { time: '12:00 PM', platform: 'Instagram', content: 'How to stay consistent' },
    { time: '4:00 PM', platform: 'Email', content: 'Spring CTA blast' },
    { time: '7:00 PM', platform: 'YouTube', content: 'AI automation trick' }
  ];

  const platforms = [
    { key: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'from-blue-500 to-blue-600', page: 'generate-linkedin' },
    { key: 'instagram', icon: Instagram, label: 'Instagram', color: 'from-pink-500 to-purple-600', page: 'generate-instagram' },
    { key: 'youtube', icon: Youtube, label: 'YouTube', color: 'from-red-500 to-red-600', page: 'generate-youtube' },
    { key: 'medium', icon: BookOpen, label: 'Medium', color: 'from-orange-500 to-amber-500', page: 'generate-medium' },
    { key: 'email', icon: Mail, label: 'Email', color: 'from-emerald-500 to-teal-500', page: 'email-outreach' }
  ];

  const quickActions = [
    { icon: Linkedin, label: 'LinkedIn Post', page: 'generate-linkedin', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { icon: Instagram, label: 'Instagram Reel', page: 'generate-instagram', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
    { icon: Youtube, label: 'YouTube Short', page: 'generate-youtube', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
    { icon: Mail, label: 'Newsletter', page: 'generate-medium', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { icon: Target, label: 'Lead Discovery', page: 'lead-discovery', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    { icon: Send, label: 'Email Outreach', page: 'email-outreach', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
    { icon: MessageSquare, label: 'Cold DM', page: 'quickgen', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { icon: Sparkles, label: 'Brand Ideas', page: 'brand', color: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' }
  ];

  const pipelineData = [
    { label: 'Auto-Generated', count: 120, max: 150, color: 'bg-gradient-to-r from-yellow-400 to-orange-400' },
    { label: 'Drafts', count: 43, max: 150, color: 'bg-gradient-to-r from-blue-400 to-cyan-400' },
    { label: 'Basket', count: 18, max: 150, color: 'bg-gradient-to-r from-purple-400 to-pink-400' },
    { label: 'Scheduled', count: 27, max: 150, color: 'bg-gradient-to-r from-pink-400 to-rose-400' },
    { label: 'Published', count: 11, max: 150, color: 'bg-gradient-to-r from-green-400 to-emerald-400' }
  ];

  return <DashboardV2 setCurrentPage={setCurrentPage} />;
};

// ============ MAIN APP COMPONENT ============
const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState('dark');

  const renderPage = () => {
    switch(currentPage) {
      case 'generate-linkedin':
        return <GenerateLinkedIn onBack={() => setCurrentPage('dashboard')} />;
      case 'generate-instagram':
        return <GenerateInstagram onBack={() => setCurrentPage('dashboard')} />;
      case 'generate-youtube':
        return <GenerateYouTube onBack={() => setCurrentPage('dashboard')} />;
      case 'generate-email':
        return <EmailOutreachSystem />;
      case 'generate-medium':
        return <GenerateMedium onBack={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'quickgen':
        return <QuickGenShortcutsPage />;
      case 'drafts':
        return <DraftsPage />;
      case 'basket':
        return <BasketPage />;
      case 'history':
        return <HistoryPage />;
      case 'schedule':
        return <SchedulerPage />;
      case 'templates':
        return <TemplatesPage />;
      case 'brand':
        return <BrandVoicePage />;
      case 'lead-discovery':
        return <LeadDashboard />;
      case 'email-outreach':
        return <EmailOutreachSystem />;
      default:
        return <Dashboard setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className={`h-screen w-screen ${theme === 'dark' ? 'dark' : ''} bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden`}>
      {/* Animated Background Decorations (Dark Mode) */}
      {theme === 'dark' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
      )}

      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Layout - Offset by sidebar width on desktop */}
      <div className={`flex flex-col h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        {/* Topbar */}
        <Topbar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          setTheme={setTheme}
        />

        {/* Main Content */}
        <main className="relative z-10 flex-1 overflow-auto pt-16">
          <div className="w-full h-full px-6 py-6 sm:px-8 lg:px-12 xl:px-16">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;

