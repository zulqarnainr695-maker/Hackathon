import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  History, 
  Users, 
  Plus, 
  QrCode, 
  RefreshCw, 
  ArrowRight,
  User,
  Calendar,
  Activity,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { api } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalAssets: 0,
    operationalAssets: 0,
    issuesReported: 0,
    underMaintenance: 0,
    resolvedIssues: 0,
    technicianCount: 0
  });

  // Modal States
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddWO, setShowAddWO] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState({
    name: '',
    category: 'HVAC Systems',
    location: '',
    model: '',
    serialNumber: '',
    criticality: 'Medium'
  });

  // New Work Order Form State
  const [newWO, setNewWO] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'Medium',
    assignedTechId: '',
    dueDate: ''
  });

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const assetsRes = await api.assets.getAll();
      const logsRes = await api.logs.getAll();
      const woRes = await api.workOrders.getAll();
      const techRes = await api.technicians.getAll();

      const assetsList = assetsRes.data;
      const logsList = logsRes.data;
      const wosList = woRes.data;
      const techList = techRes.data;

      setAssets(assetsList);
      setLogs(logsList);
      setWorkOrders(wosList);
      setTechnicians(techList);

      // Initialize dropdown defaults for forms
      if (assetsList.length > 0) {
        setNewWO(prev => ({ ...prev, assetId: assetsList[0].id }));
      }
      if (techList.length > 0) {
        setNewWO(prev => ({ ...prev, assignedTechId: techList[0].id }));
      }

      // Calculations
      const totalAssets = assetsList.length;
      const operationalAssets = assetsList.filter(a => a.status === 'Operational').length;
      const issuesReported = assetsList.filter(a => a.status === 'Degraded' || a.status === 'Critical').length;
      const underMaintenance = assetsList.filter(a => a.status === 'Maintenance').length;
      const resolvedIssues = logsList.length; // Count of all maintenance events logged
      const technicianCount = techList.length;

      setStats({
        totalAssets,
        operationalAssets,
        issuesReported,
        underMaintenance,
        resolvedIssues,
        technicianCount
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddAsset = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.location) {
      alert('Please fill out Name and Location fields.');
      return;
    }

    const generatedId = `QR-${newAsset.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const assetToSave = {
      id: generatedId,
      ...newAsset,
      status: 'Operational',
      health: 100,
      installDate: new Date().toISOString().split('T')[0],
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      specifications: {
        power: 'Standard',
        operationalRating: 'Grade A'
      },
      aiAlert: null
    };

    try {
      await api.assets.save(assetToSave);
      setShowAddAsset(false);
      setNewAsset({
        name: '',
        category: 'HVAC Systems',
        location: '',
        model: '',
        serialNumber: '',
        criticality: 'Medium'
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWorkOrder = async (e) => {
    e.preventDefault();
    if (!newWO.title || !newWO.description || !newWO.dueDate) {
      alert('Please fill out Title, Description, and Due Date.');
      return;
    }

    try {
      await api.workOrders.save({
        ...newWO,
        status: newWO.assignedTechId ? 'Assigned' : 'Backlog'
      });
      setShowAddWO(false);
      setNewWO({
        assetId: assets[0]?.id || '',
        title: '',
        description: '',
        priority: 'Medium',
        assignedTechId: technicians[0]?.id || '',
        dueDate: ''
      });
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispatchCrewFromIssue = async (issueAsset) => {
    const customWO = {
      assetId: issueAsset.id,
      title: `Emergency Repair: ${issueAsset.name}`,
      description: issueAsset.aiAlert 
        ? `Resolve Anomaly: ${issueAsset.aiAlert.message}`
        : `Investigate reported status issue. Current health: ${issueAsset.health}%. Check components and fluid seals.`,
      priority: issueAsset.status === 'Critical' ? 'Emergency' : 'High',
      status: 'Assigned',
      assignedTechId: 'tech-1', // Default Marcus Vance
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
    };

    try {
      await api.workOrders.save(customWO);
      
      // Update asset to Maintenance state immediately
      const updatedAsset = { ...issueAsset, status: 'Maintenance' };
      await api.assets.save(updatedAsset);
      
      alert(`Work order ${customWO.title} generated and assigned. Asset state shifted to 'Maintenance'.`);
      loadDashboardData();
    } catch (err) {
      console.error(err);
    }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Operational': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Degraded': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Critical': return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Maintenance': return <Wrench className="w-3.5 h-3.5 text-blue-400" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Degraded': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Maintenance': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // Filter assets that have problems (Degraded or Critical)
  const recentIssues = assets.filter(a => a.status === 'Degraded' || a.status === 'Critical');

  // Sort assets by upcoming nextServiceDate to find nearest service schedule
  const upcomingMaintenance = [...assets]
    .filter(a => a.status !== 'Critical') // Critical requires active work orders, not scheduled PMS
    .sort((a, b) => new Date(a.nextServiceDate) - new Date(b.nextServiceDate))
    .slice(0, 3)
    .map(a => {
      const daysRemaining = Math.ceil((new Date(a.nextServiceDate) - new Date()) / (1000 * 60 * 60 * 24));
      return { ...a, daysRemaining };
    });

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Top Banner Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Platform Control Room</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time counts, connected machinery diagnostics, timeline logging, and technician dispatches.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-md font-mono">
            Mode: Simulator Active
          </span>
        </div>
      </div>

      {/* Summary Cards Grid (6 cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Card 1: Total Assets */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Total Assets</span>
            <HardDrive className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-white">{loading ? '...' : stats.totalAssets}</h3>
            <p className="text-[9px] text-slate-500">Connected nodes</p>
          </div>
        </div>

        {/* Card 2: Operational Assets */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Operational</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-emerald-400">{loading ? '...' : stats.operationalAssets}</h3>
            <p className="text-[9px] text-slate-500">Running nominal</p>
          </div>
        </div>

        {/* Card 3: Issues Reported */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Issues Reported</span>
            <AlertTriangle className="w-4 h-4 text-rose-500/80 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h3 className={`text-2xl font-extrabold ${stats.issuesReported > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
              {loading ? '...' : stats.issuesReported}
            </h3>
            <p className="text-[9px] text-slate-500">Degraded or Critical</p>
          </div>
        </div>

        {/* Card 4: Under Maintenance */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">In Maintenance</span>
            <Wrench className="w-4 h-4 text-blue-500/80" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-blue-400">{loading ? '...' : stats.underMaintenance}</h3>
            <p className="text-[9px] text-slate-500">Active repair dispatches</p>
          </div>
        </div>

        {/* Card 5: Resolved Issues */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Resolved Tasks</span>
            <History className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-white">{loading ? '...' : stats.resolvedIssues}</h3>
            <p className="text-[9px] text-slate-500">Service logs recorded</p>
          </div>
        </div>

        {/* Card 6: Technicians */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-28 hover:border-slate-700/60 transition-all group">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">Techs Active</span>
            <Users className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-extrabold text-white">{loading ? '...' : stats.technicianCount}</h3>
            <p className="text-[9px] text-slate-500">Dispatch crew active</p>
          </div>
        </div>

      </div>

      {/* Main Split Layout: Left (Table & Actions) vs Right (Timeline & Upcoming) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 units): Recent Issues Table & Quick Actions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Recent Issues Table */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <div className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Recent Telemetry Issues</h3>
                <p className="text-[10px] text-slate-550">Active sensor violations requiring engineer inspection dispatches.</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
              </div>
            ) : recentIssues.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
                <CheckCircle2 className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                All connected nodes nominal. No issues reported.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-900 font-bold uppercase tracking-wider">
                      <th className="py-2.5">Asset / Code</th>
                      <th className="py-2.5">Location</th>
                      <th className="py-2.5">Health</th>
                      <th className="py-2.5">Severity</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {recentIssues.map((issue) => (
                      <tr key={issue.id} className="hover:bg-slate-900/15 transition-colors group">
                        <td className="py-3 font-semibold">
                          <Link to={`/assets/${issue.id}`} className="block text-slate-200 hover:text-violet-400">
                            <span>{issue.name}</span>
                            <span className="font-mono text-[9px] text-slate-500 block">{issue.id}</span>
                          </Link>
                        </td>
                        <td className="py-3 text-slate-450">{issue.location}</td>
                        <td className="py-3 font-mono font-bold text-rose-400">{issue.health}% HP</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusClass(issue.status)}`}>
                            <span className={`w-1 h-1 rounded-full ${issue.status === 'Critical' ? 'bg-rose-400 animate-ping' : 'bg-amber-400'}`} />
                            <span>{issue.status}</span>
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <Link 
                            to={`/assets/${issue.id}`}
                            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-250 font-medium inline-block text-[10px]"
                          >
                            Inspect
                          </Link>
                          <button 
                            onClick={() => handleDispatchCrewFromIssue(issue)}
                            className="px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold shadow-md shadow-violet-600/15 active:translate-y-0.5 transition-colors"
                          >
                            Dispatch Crew
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900">
              Quick Action Console
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Action 1 */}
              <button
                onClick={() => setShowAddAsset(true)}
                className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-800 transition-all text-center flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-violet-400 group"
              >
                <div className="p-2 rounded bg-slate-950 border border-slate-850 group-hover:border-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="font-bold block">Register Asset</span>
              </button>

              {/* Action 2 */}
              <button
                onClick={() => setShowAddWO(true)}
                className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-800 transition-all text-center flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-violet-400 group"
              >
                <div className="p-2 rounded bg-slate-950 border border-slate-850 group-hover:border-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="font-bold block">Dispatch Ticket</span>
              </button>

              {/* Action 3 */}
              <Link
                to="/scan-qr"
                className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-800 transition-all text-center flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-violet-400 group"
              >
                <div className="p-2 rounded bg-slate-950 border border-slate-850 group-hover:border-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="font-bold block">Scan QR Code</span>
              </Link>

              {/* Action 4 */}
              <button
                onClick={handleResetDB}
                disabled={isResetting}
                className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 hover:bg-slate-900 hover:border-slate-800 transition-all text-center flex flex-col items-center justify-center space-y-2 text-slate-300 hover:text-violet-400 group disabled:opacity-50"
              >
                <div className="p-2 rounded bg-slate-950 border border-slate-850 group-hover:border-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors">
                  <RefreshCw className={`w-5 h-5 ${isResetting ? 'animate-spin' : ''}`} />
                </div>
                <span className="font-bold block">Reset Simulator</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (4 units): Activities Timeline & Upcoming Maintenance */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Upcoming Maintenance Card */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h3 className="font-bold text-slate-200 text-sm">Upcoming Service due</h3>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
              </div>
            ) : upcomingMaintenance.length === 0 ? (
              <p className="text-slate-500 text-center py-2 text-xs">No scheduled maintenance due.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {upcomingMaintenance.map(item => (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-950/30 border border-slate-850 hover:border-slate-800 transition-colors rounded-lg space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <Link to={`/assets/${item.id}`} className="font-bold text-slate-300 hover:text-violet-400 truncate max-w-[150px]">
                        {item.name}
                      </Link>
                      <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full
                        ${item.daysRemaining <= 7 
                          ? 'bg-rose-500/10 text-rose-400 animate-pulse border border-rose-500/20' 
                          : item.daysRemaining <= 15 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-slate-900 text-slate-400 border border-slate-850'}
                      `}>
                        {item.daysRemaining <= 0 ? 'OVERDUE' : `In ${item.daysRemaining} days`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Location: <span className="font-semibold">{item.location.split(',')[0]}</span></span>
                      <span className="font-mono text-slate-500">Due: {item.nextServiceDate.substring(5)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activities Timeline */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-violet-400" />
                <h3 className="font-bold text-slate-200 text-sm">Recent Activities</h3>
              </div>
              <Link to="/history" className="text-[10px] text-violet-400 hover:text-violet-300 font-semibold hover:underline">
                View all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
                <div className="h-10 bg-slate-900/60 rounded shimmer" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-slate-500 text-center py-4 text-xs">No platform activities logged.</p>
            ) : (
              <div className="relative pl-4 border-l border-slate-900 space-y-4 text-[11px]">
                {logs.slice(0, 4).map(log => {
                  const targetAsset = assets.find(a => a.id === log.assetId);
                  return (
                    <div key={log.id} className="relative space-y-1">
                      {/* Circle dot marker */}
                      <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full border border-slate-950 bg-violet-500 shadow-glow" />
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>{log.date}</span>
                        <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 font-bold uppercase">{log.type}</span>
                      </div>
                      
                      <div className="font-bold text-slate-350 leading-tight">
                        <Link to={`/assets/${log.assetId}`} className="hover:text-violet-400 hover:underline">
                          {targetAsset ? targetAsset.name : log.assetId}
                        </Link>
                      </div>
                      <p className="text-slate-400 line-clamp-2 leading-relaxed">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-550 pt-0.5">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.technician}</span>
                        <span>•</span>
                        <span>${log.cost}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Register Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Register Asset Node</h3>
            
            <form onSubmit={handleAddAsset} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carrier HVAC Compressor"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="HVAC Systems">HVAC Systems</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Utility Systems">Utility Systems</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Criticality</label>
                  <select
                    value={newAsset.criticality}
                    onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Facility Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building A, Rooftop Section 4"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Model Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WeatherMaker 50TC"
                    value={newAsset.model}
                    onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Serial Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-98218"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddAsset(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/10 transition-all"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Ticket Modal */}
      {showAddWO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Create Dispatch Ticket</h3>
            
            <form onSubmit={handleCreateWorkOrder} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Ticket Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inspect HVAC Vibration mountings"
                  value={newWO.title}
                  onChange={(e) => setNewWO({ ...newWO, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Target Asset Node</label>
                <select
                  value={newWO.assetId}
                  onChange={(e) => setNewWO({ ...newWO, assetId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Priority</label>
                  <select
                    value={newWO.priority}
                    onChange={(e) => setNewWO({ ...newWO, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans">Technician</label>
                  <select
                    value={newWO.assignedTechId}
                    onChange={(e) => setNewWO({ ...newWO, assignedTechId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  >
                    <option value="">Unassigned (Send to Backlog)</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.role.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans font-medium">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newWO.dueDate}
                  onChange={(e) => setNewWO({ ...newWO, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Troubleshooting Instructions *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detail failure signals, diagnostic checks, joint specs, etc."
                  value={newWO.description}
                  onChange={(e) => setNewWO({ ...newWO, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddWO(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/10 transition-all"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
