import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  QrCode, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Menu,
  Sun,
  Moon
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const Navbar = ({ toggleMobileSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');

  // Initialize and toggle theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('maintainiq_theme') || 'dark';
    setThemeMode(savedTheme);
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    localStorage.setItem('maintainiq_theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
      showToast('Theme switched to Light mode.', 'info');
    } else {
      document.documentElement.classList.remove('light');
      showToast('Theme switched to Cyber Dark mode.', 'info');
    }
  };

  // Get active page name from route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Command Center';
      case '/assets': return 'Assets & QR Catalog';
      case '/issues': return 'Telemetry Issues Register';
      case '/work-orders': return 'Work Orders & Dispatch';
      case '/history': return 'Asset Maintenance Logs';
      case '/technicians': return 'Engineering Crew Directory';
      case '/reports': return 'Platform Reports & Charts';
      case '/profile': return 'My Profile Explorer';
      case '/scan-qr': return 'QR Scanner Simulator';
      case '/settings': return 'Platform Preferences';
      case '/ai-triage': return 'AI Triage Center';
      case '/technician-dashboard': return 'Technician Job Control';
      default: 
        if (location.pathname.startsWith('/assets/')) return 'Asset Detail Explorer';
        if (location.pathname.startsWith('/maintenance/')) return 'Complete Maintenance Log';
        return 'MaintainIQ Platform';
    }
  };

  // Fetch critical/degraded assets to generate notifications
  const loadNotifications = async () => {
    try {
      const res = await api.assets.getAll();
      const assetsWithAlerts = res.data.filter(a => a.aiAlert);
      const wos = await api.workOrders.getAll();
      const urgentWos = wos.data.filter(w => w.priority === 'Emergency' || w.priority === 'High');
      
      const list = [];
      assetsWithAlerts.forEach(a => {
        list.push({
          id: `alert-asset-${a.id}`,
          type: a.status === 'Critical' ? 'critical' : 'warning',
          title: `AI Health Alert: ${a.name}`,
          message: a.aiAlert.message,
          link: `/assets/${a.id}`,
          time: 'Just now'
        });
      });

      urgentWos.forEach(w => {
        if (w.status !== 'Completed') {
          list.push({
            id: `alert-wo-${w.id}`,
            type: 'dispatch',
            title: `Urgent Work Order: ${w.title}`,
            message: `Priority: ${w.priority}. Assigned to technician. Due: ${w.dueDate}`,
            link: '/work-orders',
            time: '10m ago'
          });
        }
      });

      setNotifications(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Poll notifications every 10 seconds to simulate real-time AI updates
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Simple mock search routing - see if search query matches asset QR ID directly
    const query = searchQuery.trim().toUpperCase();
    if (query.startsWith('QR-')) {
      navigate(`/assets/${query}`);
    } else {
      navigate(`/assets?search=${searchQuery}`);
    }
    setSearchQuery('');
  };

  const handleResetDB = async () => {
    if (window.confirm('Reset local simulator database to default assets and work orders?')) {
      setIsResetting(true);
      try {
        await api.system.reset();
        window.location.reload();
      } catch (err) {
        console.error(err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <header className="h-16 sticky top-0 z-30 glass-panel border-b border-slate-800/60 px-6 flex items-center justify-between">
      {/* Title & Hamburger Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors md:hidden"
          title="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-none truncate max-w-[150px] sm:max-w-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Mock Search Form */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-64">
          <input
            type="text"
            placeholder="Search assets (e.g. QR-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-300 placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
        </form>

        {/* Dark/Light Mode Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
          title="Toggle Light/Dark Theme Mode"
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* System Health Check */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse glow-green" />
          <span>Platform Active</span>
        </div>

        {/* Reset Database Button */}
        <button
          onClick={handleResetDB}
          disabled={isResetting}
          className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5"
          title="Reset database to defaults"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline text-xs font-medium">Reset Simulator</span>
        </button>

        {/* QR Scanner Quick Button */}
        <Link
          to="/scan-qr"
          className="p-2 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all flex items-center gap-1.5"
          title="Simulate scanning a QR Code"
        >
          <QrCode className="w-4 h-4 text-violet-400" />
          <span className="hidden sm:inline text-xs font-semibold font-sans">Quick Scan</span>
        </Link>

        {/* Notifications Center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all relative"
            title="AI Health Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center shadow-lg border border-slate-950 animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden z-50 animate-slide-down">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-slate-200">AI Predictive Alarms</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold uppercase tracking-wider">
                  Real-time
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-900">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-550 text-xs">
                    <CheckCircle2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                    All assets operational. No predictive alarms.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setShowNotifications(false)}
                      className="block p-4 hover:bg-slate-900/40 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'critical' ? (
                          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                        ) : n.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <h4 className="text-xs font-semibold text-slate-200 leading-tight">
                            {n.title}
                          </h4>
                          <p className="text-[11px] text-slate-455 mt-1 leading-normal">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-600 font-semibold block mt-1.5">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-800 text-center bg-slate-900/25">
                <Link
                  to="/ai-insights"
                  onClick={() => setShowNotifications(false)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold hover:underline"
                >
                  View complete AI dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
