import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  Cpu, 
  Database, 
  Check, 
  Save, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

const SettingsPage = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Settings Form State
  const [settings, setSettings] = useState({
    facilityName: 'Austin GigaFactory Assembly Wing',
    alertEmails: 'maintainers@gigafactory.com',
    hvacTempThreshold: 74,
    vibrationLimit: 12.5,
    pressureThreshold: 180,
    enableNotifications: true,
    enableAIPredictions: true,
    backupInterval: 'Daily'
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccessMsg('Platform configuration updated successfully.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleResetDB = async () => {
    if (window.confirm('Are you sure you want to purge all custom work orders and asset status changes and restore default database nodes?')) {
      setIsResetting(true);
      try {
        await api.system.reset();
        setSuccessMsg('Simulator database reset. Reloading assets...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } catch (err) {
        console.error(err);
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" />
          <span>Platform Preferences</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure asset telemetry margins, notifications triggers, and mock data simulators.</p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-xs text-emerald-400 animate-slide-down">
          <Check className="w-4.5 h-4.5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Settings Sections Grid */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Row 1: General Facility & Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Specs */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-violet-400" />
              <span>Facility Profile</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Facility Identifier</label>
                <input
                  type="text"
                  value={settings.facilityName}
                  onChange={(e) => setSettings({ ...settings, facilityName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide font-mono">Operations Dispatch Email</label>
                <input
                  type="email"
                  value={settings.alertEmails}
                  onChange={(e) => setSettings({ ...settings, alertEmails: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-400" />
              <span>Notification Decoders</span>
            </h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-2 hover:bg-slate-950/40 rounded border border-transparent hover:border-slate-950 transition-all">
                <div>
                  <span className="font-bold text-slate-350 block">Enable Email Dispatch Dispatcher</span>
                  <span className="text-[10px] text-slate-500">Auto-route work order reports to engineers</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 hover:bg-slate-950/40 rounded border border-transparent hover:border-slate-950 transition-all">
                <div>
                  <span className="font-bold text-slate-350 block font-sans">Enable AI Predictive Warnings</span>
                  <span className="text-[10px] text-slate-500">Enable neural net model analysis logs</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableAIPredictions}
                  onChange={(e) => setSettings({ ...settings, enableAIPredictions: e.target.checked })}
                  className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Telemetry threshold configurations */}
        <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400 animate-pulse-slow" />
            <span>AI Telemetry Threshold Margins</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">
                Max Press Temp Limit: <span className="font-mono text-violet-400 font-semibold">{settings.hvacTempThreshold}°C</span>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.hvacTempThreshold}
                onChange={(e) => setSettings({ ...settings, hvacTempThreshold: Number(e.target.value) })}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-600 border border-slate-800"
              />
              <span className="text-[10px] text-slate-550 block mt-1">Triggers diagnostic alarm above this.</span>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide font-sans">
                Vibration Max (mm/s): <span className="font-mono text-violet-400 font-semibold">{settings.vibrationLimit}Hz</span>
              </label>
              <input
                type="range"
                min="5"
                max="25"
                step="0.5"
                value={settings.vibrationLimit}
                onChange={(e) => setSettings({ ...settings, vibrationLimit: Number(e.target.value) })}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-600 border border-slate-800"
              />
              <span className="text-[10px] text-slate-550 block mt-1">Triggers motor mount warnings.</span>
            </div>

            <div>
              <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">
                Critical Pressure (PSI): <span className="font-mono text-violet-400 font-semibold">{settings.pressureThreshold} PSI</span>
              </label>
              <input
                type="range"
                min="100"
                max="300"
                value={settings.pressureThreshold}
                onChange={(e) => setSettings({ ...settings, pressureThreshold: Number(e.target.value) })}
                className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-600 border border-slate-800"
              />
              <span className="text-[10px] text-slate-550 block mt-1">Triggers hydraulic stamp failures.</span>
            </div>
          </div>
        </div>

        {/* Row 3: Simulator utils */}
        <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2 text-rose-400">
            <Database className="w-4 h-4 text-rose-500" />
            <span>Simulator Database Operations</span>
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rose-500/5 border border-rose-500/10 p-4 rounded-lg text-xs">
            <div className="space-y-1">
              <span className="font-bold text-white block flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                <span>Destructive Reset Action</span>
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed max-w-xl">
                Restoring default registers will purge all newly added assets, registered service timeline events, Kanban work order comments, and reset machine statuses to initial states.
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleResetDB}
              disabled={isResetting}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-350 hover:text-white font-semibold transition-all shadow-md shadow-rose-950/15 text-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Purge & Reset DB</span>
            </button>
          </div>
        </div>

        {/* Form Action save */}
        <div className="flex justify-end pt-4 border-t border-slate-900">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg shadow-violet-500/15 active:translate-y-0.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
