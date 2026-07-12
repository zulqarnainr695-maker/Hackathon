import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Tag, 
  Heart, 
  Activity, 
  Calendar, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { DetailSkeleton } from '../components/Skeletons';

const PublicAsset = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssetData = async () => {
      try {
        setLoading(true);
        const assetRes = await api.assets.getById(id);
        setAsset(assetRes.data);
        
        const logsRes = await api.logs.getByAssetId(id);
        // Only show safe, non-internal activities on the public view
        setLogs(logsRes.data.filter(l => l.type === 'Preventive' || l.type === 'Installation'));
      } catch (err) {
        console.error(err);
        setError('Asset QR node not found or unregistered.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssetData();
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Operational': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Degraded': return <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />;
      case 'Critical': return <XCircle className="w-4 h-4 text-rose-450 animate-bounce" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-blue-400 animate-spin-slow" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-450" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Degraded': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Maintenance': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-550/20';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/15';
      case 'Good': return 'text-teal-400 bg-teal-500/5 border-teal-500/15';
      case 'Fair': return 'text-amber-400 bg-amber-500/5 border-amber-500/15';
      case 'Poor': return 'text-rose-455 bg-rose-500/5 border-rose-500/15';
      default: return 'text-slate-400 bg-slate-550/5 border-slate-550/15';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col justify-center max-w-4xl mx-auto">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
        <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-rose-500 mb-4 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Unregistered Node</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{error}</p>
        <Link to="/login" className="mt-6 px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-semibold">
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4">
      <div className="bg-glow-purple top-10 left-[15%] w-72 h-72 pointer-events-none" />
      
      {/* Brand Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm text-slate-200">MaintainIQ Public Portal</span>
        </div>
        <Link to="/login" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
          Staff Login →
        </Link>
      </header>

      {/* Main Details Panel */}
      <main className="max-w-xl mx-auto w-full mt-8 flex-1 space-y-6">
        
        {/* Core Asset Overview */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4 bg-slate-950/20">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="font-mono text-[9px] text-slate-500 block uppercase tracking-wider">{asset.id}</span>
              <h2 className="text-xl font-black text-white leading-tight mt-1">{asset.name}</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">{asset.category}</p>
            </div>
            
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusClass(asset.status)}`}>
              {getStatusIcon(asset.status)}
              <span>{asset.status}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-550 block font-bold uppercase tracking-wider text-[8.5px]">Facility Location</span>
              <div className="flex items-center gap-1.5 text-slate-350 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">{asset.location}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-550 block font-bold uppercase tracking-wider text-[8.5px]">Node Condition</span>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-slate-650 shrink-0" />
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getConditionColor(asset.condition)}`}>
                  {asset.condition || 'Good'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4 text-xs">
            <div>
              <span className="text-slate-550 block font-bold uppercase tracking-wider text-[8.5px]">Last Service Date</span>
              <span className="text-slate-350 font-semibold block mt-1">{asset.lastServiceDate || 'Not Logged'}</span>
            </div>
            <div>
              <span className="text-slate-550 block font-bold uppercase tracking-wider text-[8.5px]">Next Service Target</span>
              <span className="text-slate-350 font-semibold block mt-1">{asset.nextServiceDate || 'Not Scheduled'}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Report Telemetry Issue */}
        <Link
          to={`/report-issue/${asset.id}`}
          className="flex items-center justify-between w-full p-4 rounded-xl border border-rose-500/20 hover:border-rose-500/40 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold text-xs transition-all group"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <div className="text-left">
              <span className="block font-semibold">Flag Telemetry Issue</span>
              <span className="text-[10px] text-rose-500 font-medium block mt-0.5">Report component leaks, sensor failures or mechanical slips</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Public Activity Timeline */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800/80 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span>Public Safety Operations Activity</span>
          </h3>

          {logs.length === 0 ? (
            <p className="text-slate-550 text-xs py-4 text-center">No safety activities recorded for this node.</p>
          ) : (
            <div className="space-y-4 relative pl-4 border-l border-slate-900">
              {logs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  {/* Timeline bullet */}
                  <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-slate-950" />
                  
                  <div className="flex items-start justify-between flex-wrap gap-1.5">
                    <span className="font-semibold text-slate-200">{log.type} Service Inspection Completed</span>
                    <span className="text-[10px] text-slate-600 font-mono font-bold">{log.date}</span>
                  </div>
                  <p className="text-slate-500 mt-1 leading-normal">{log.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Sticky Footer */}
      <footer className="max-w-xl mx-auto w-full text-center mt-12 text-[10px] text-slate-600 border-t border-slate-900/60 pt-4">
        © {new Date().getFullYear()} MaintainIQ Corp. All safety and credentials audit access is strictly encrypted.
      </footer>
    </div>
  );
};

export default PublicAsset;
