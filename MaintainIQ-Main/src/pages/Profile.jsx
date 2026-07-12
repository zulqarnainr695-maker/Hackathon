import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Calendar, Shield, Save, Check, History, Key } from 'lucide-react';
import { api } from '../services/api';

const Profile = () => {
  const [userData, setUserData] = useState({
    name: 'Elena Rostova',
    email: 'admin@maintainiq.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  });

  const [fullNameInput, setFullNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Mock profile audit logs
  const auditLogs = [
    { id: '1', event: 'Database simulation sync triggered', date: 'Just now', ip: '192.168.1.42' },
    { id: '2', event: 'Viewed predictive health graphs', date: '10 mins ago', ip: '192.168.1.42' },
    { id: '3', event: 'Completed work order WO-104: Robot joint seal', date: 'Yesterday', ip: '192.168.1.42' },
    { id: '4', event: 'Authorized new technician account Sarah Connor', date: '3 days ago', ip: '192.168.1.40' }
  ];

  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem('maintainiq_user'));
    if (sessionUser) {
      setUserData(sessionUser);
      setFullNameInput(sessionUser.name);
      setEmailInput(sessionUser.email);
    } else {
      setFullNameInput(userData.name);
      setEmailInput(userData.email);
    }
  }, []);

  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!fullNameInput.trim() || !emailInput.trim()) {
      alert('Please fill out Name and Email.');
      return;
    }

    api.auth.updateProfile({ name: fullNameInput.trim(), email: emailInput.trim() })
      .then(res => {
        const updatedUser = {
          ...userData,
          name: res.data.name,
          email: res.data.email
        };
        // Save session back to localStorage
        localStorage.setItem('maintainiq_user', JSON.stringify(updatedUser));
        setUserData(updatedUser);

        setSuccessMsg('Profile credentials updated successfully.');
        setTimeout(() => {
          setSuccessMsg('');
          // Force window reload to update Sidebar avatar / details instantly!
          window.location.reload();
        }, 1200);
      })
      .catch(err => {
        alert(err.response?.data?.message || 'Failed to update profile.');
      });
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-4xl animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="w-6 h-6 text-slate-400" />
          <span>My Profile Explorer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage user email preferences, edit profile metadata details, and monitor terminal session logins.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 animate-slide-down">
          <Check className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Main split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column (5 units): Profile Card & Avatar */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Card profile */}
          <div className="glass-panel rounded-xl border border-slate-800 p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-violet-600 shadow-glow" />

            <div className="flex flex-col items-center justify-center space-y-3">
              <img 
                src={userData.avatar} 
                alt={userData.name} 
                className="w-24 h-24 rounded-full border border-violet-500/30 object-cover ring-4 ring-violet-500/10 shadow-lg"
              />
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{userData.name}</h3>
                <span className="text-[10px] uppercase font-bold text-violet-400 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 inline-block mt-2">
                  {userData.role}
                </span>
              </div>
            </div>

            {/* Profile specifications metadata */}
            <div className="border-t border-slate-900/60 pt-4 space-y-2.5 text-xs text-left">
              <div className="flex items-center gap-3 text-slate-400">
                <Mail className="w-4 h-4 text-slate-650 shrink-0" />
                <span className="truncate">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Briefcase className="w-4 h-4 text-slate-650 shrink-0" />
                <span>MaintainIQ Austin GigaFactory Division</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <Shield className="w-4 h-4 text-slate-650 shrink-0" />
                <span>Security clearance Level: Tier 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 units): Preferences Settings & Audit Logs */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Form edit profile */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900">
              Profile Metadata Details
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Display Full Name</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={fullNameInput}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2.5 text-slate-300 focus:outline-none transition-colors"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Contact Email Address</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2.5 text-slate-300 focus:outline-none transition-colors font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/10 transition-all active:translate-y-0.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* User logs trail */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-violet-400" />
              <span>Terminal Audit Trail</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {auditLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-2.5 rounded bg-slate-950/40 border border-slate-950 text-slate-350 hover:border-slate-800 transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold block text-slate-200">{log.event}</span>
                    <span className="text-[9px] text-slate-550 block font-mono">Terminal IP: {log.ip}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{log.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;
