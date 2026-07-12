import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Search, 
  DollarSign, 
  Clock, 
  Percent,
  User,
  HardDrive,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

const MaintenanceLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Aggregate Stats
  const [stats, setStats] = useState({
    totalCost: 0,
    totalDowntime: 0,
    preventiveCount: 0,
    repairCount: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const logsRes = await api.logs.getAll();
      const assetsRes = await api.assets.getAll();

      const logsList = logsRes.data;
      const assetsList = assetsRes.data;

      setLogs(logsList);
      setAssets(assetsList);

      // Calculations
      const totalCost = logsList.reduce((acc, curr) => acc + curr.cost, 0);
      const totalDowntime = logsList.reduce((acc, curr) => acc + curr.downtimeMinutes, 0);
      const preventiveCount = logsList.filter(l => l.type === 'Preventive').length;
      const repairCount = logsList.filter(l => l.type !== 'Preventive').length;

      setStats({ totalCost, totalDowntime, preventiveCount, repairCount });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAssetName = (assetId) => {
    return assets.find(a => a.id === assetId)?.name || assetId;
  };

  const filteredLogs = logs.filter(log => {
    const assetName = getAssetName(log.assetId).toLowerCase();
    const description = log.description.toLowerCase();
    const tech = log.technician.toLowerCase();
    const type = log.type.toLowerCase();
    const query = searchQuery.toLowerCase();

    return assetName.includes(query) || 
           description.includes(query) || 
           tech.includes(query) || 
           type.includes(query) ||
           log.assetId.toLowerCase().includes(query);
  });

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Asset Maintenance Logs</h2>
        <p className="text-xs text-slate-400 mt-1">Audit trail of past repairs, periodic calibrations, expenses, and downtime logs.</p>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cost card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-750/60 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Accumulated Spending</span>
            <h3 className="text-2xl font-black text-emerald-400">${stats.totalCost.toLocaleString()}</h3>
            <span className="text-[10px] text-slate-500">All recorded parts & hours</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Downtime card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-750/60 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Machine Downtime</span>
            <h3 className="text-2xl font-black text-rose-400">{Math.round(stats.totalDowntime / 60 * 10) / 10} Hours</h3>
            <span className="text-[10px] text-slate-500">Sum of maintenance cycles</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Ratio card */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-750/60 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Preventive Task Ratio</span>
            <h3 className="text-2xl font-black text-violet-400">
              {logs.length > 0 ? `${Math.round((stats.preventiveCount / logs.length) * 100)}%` : '0%'}
            </h3>
            <span className="text-[10px] text-slate-500">Goal: &gt;75% PM target</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtering Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80 flex items-center">
          <input
            type="text"
            placeholder="Search technician, description, asset code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
        </div>
      </div>

      {/* Main Logs Table */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-12 bg-slate-900/60 rounded-xl shimmer" />
          <div className="h-12 bg-slate-900/60 rounded-xl shimmer" />
          <div className="h-12 bg-slate-900/60 rounded-xl shimmer" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-16 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <History className="w-12 h-12 text-slate-850 mx-auto mb-3" />
          No maintenance logs match your filter criteria.
        </div>
      ) : (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-4 w-28">Date</th>
                  <th className="p-4 w-48">Asset Node</th>
                  <th className="p-4 w-24">Type</th>
                  <th className="p-4">Work Performed</th>
                  <th className="p-4 w-36">Technician</th>
                  <th className="p-4 w-24 text-right">Cost ($)</th>
                  <th className="p-4 w-28 text-right">Downtime (m)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/15 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-400">{log.date}</td>
                    <td className="p-4">
                      <Link 
                        to={`/assets/${log.assetId}`}
                        className="font-bold text-slate-200 hover:text-violet-400 hover:underline block truncate max-w-[180px]"
                      >
                        {getAssetName(log.assetId)}
                        <span className="font-mono text-[9px] text-slate-500 block">{log.assetId}</span>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border
                        ${log.type === 'Preventive' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : log.type === 'Emergency' 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }
                      `}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-sans leading-relaxed max-w-sm truncate" title={log.description}>
                      {log.description}
                    </td>
                    <td className="p-4 font-medium text-slate-400 flex items-center gap-1.5 pt-6">
                      <User className="w-3.5 h-3.5 text-slate-600" />
                      <span>{log.technician}</span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-slate-200">${log.cost}</td>
                    <td className="p-4 text-right font-mono text-slate-400">{log.downtimeMinutes}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceLogs;
