import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  HardDrive, 
  AlertTriangle,
  ClipboardList, 
  History, 
  Wrench, 
  Cpu,
  User,
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, isMobileOpen, closeMobileSidebar }) => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('maintainiq_user')) || {
    name: 'Elena Rostova',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  };

  const handleLogout = () => {
    api.auth.logout().finally(() => {
      localStorage.removeItem('maintainiq_user');
      localStorage.removeItem('maintainiq_token');
      if (closeMobileSidebar) closeMobileSidebar();
      navigate('/login');
    });
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Assets', path: '/assets', icon: HardDrive },
    { name: 'Issues', path: '/issues', icon: AlertTriangle },
    { name: 'Maintenance', path: '/work-orders', icon: ClipboardList },
    { name: 'Tech Portal', path: '/technician-dashboard', icon: Wrench },
    { name: 'History', path: '/history', icon: History },
    { name: 'Technicians', path: '/technicians', icon: User },
    { name: 'Reports', path: '/reports', icon: Cpu },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 glass-panel border-r border-slate-800/80 flex flex-col justify-between
          ${isMobileOpen ? 'translate-x-0 w-64' : 'max-md:-translate-x-full'}
          ${isOpen ? 'md:w-64' : 'md:w-20'}
        `}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/60">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 shadow-md shadow-violet-500/20 text-white shrink-0">
                <ShieldCheck className="w-5 h-5 animate-pulse-slow" />
              </div>
              {(isOpen || isMobileOpen) && (
                <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-wide font-sans truncate">
                  Maintain<span className="text-violet-400 font-extrabold">IQ</span>
                </span>
              )}
            </div>
            
            {/* Close Mobile Sidebar Drawer */}
            {isMobileOpen && (
              <button 
                onClick={closeMobileSidebar}
                className="p-1 rounded-md hover:bg-slate-800/65 text-slate-400 hover:text-slate-200 md:hidden"
                title="Close menu"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}

            {/* Collapse desktop toggle */}
            {!isMobileOpen && isOpen && (
              <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-md hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 transition-colors hidden md:block"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                    ${isActive 
                      ? 'bg-violet-600/15 text-violet-300 border-l-2 border-violet-500 shadow-[inset_1px_0_0_rgba(139,92,246,0.1)]' 
                      : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                      {(isOpen || isMobileOpen) ? (
                        <span className="truncate">{item.name}</span>
                      ) : (
                        <span className="absolute left-16 bg-slate-950 text-slate-200 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-50">
                          {item.name}
                        </span>
                      )}
                      {isActive && !(isOpen || isMobileOpen) && (
                        <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-glow" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="border-t border-slate-800/60 p-4 space-y-3 shrink-0">
          {(isOpen || isMobileOpen) ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src={userData.avatar} 
                  alt="User profile" 
                  className="w-10 h-10 rounded-full border border-violet-500/30 object-cover ring-2 ring-violet-500/10"
                />
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-slate-200 truncate">{userData.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{userData.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all animate-pulse-slow"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex justify-center group relative">
                <img 
                  src={userData.avatar} 
                  alt="User profile" 
                  className="w-10 h-10 rounded-full border border-violet-500/30 object-cover ring-2 ring-violet-500/10 cursor-pointer"
                />
                <span className="absolute bottom-12 left-6 bg-slate-950 text-slate-200 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50">
                  {userData.name} ({userData.role})
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-900/60 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-500/20 text-slate-450 hover:text-rose-400 transition-all group relative"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="absolute bottom-12 left-6 bg-slate-950 text-slate-200 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-800 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 whitespace-nowrap z-50">
                  Log Out
                </span>
              </button>
            </div>
          )}
          
          {/* Toggle Button for Collapsed Mode (Desktop only) */}
          {!(isOpen || isMobileOpen) && (
            <button 
              onClick={toggleSidebar}
              className="w-full mt-4 flex items-center justify-center p-1.5 rounded-md bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors hidden md:flex"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
