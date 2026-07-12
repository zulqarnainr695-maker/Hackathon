import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Settings, 
  Calendar, 
  Cpu, 
  QrCode, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  User, 
  DollarSign, 
  Clock, 
  FileText,
  Plus,
  HelpCircle,
  Copy,
  Printer,
  Download,
  Share2,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const AssetDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState(null);
  const [logs, setLogs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showAddLog, setShowAddLog] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  
  // Maintenance Log Form State
  const [newLog, setNewLog] = useState({
    type: 'Preventive',
    description: '',
    technician: '',
    cost: '',
    downtimeMinutes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const assetRes = await api.assets.getById(id);
      setAsset(assetRes.data);

      const logsRes = await api.logs.getByAssetId(id);
      setLogs(logsRes.data);

      const woRes = await api.workOrders.getAll();
      const assetWos = woRes.data.filter(w => w.assetId === id);
      setWorkOrders(assetWos);

      const techRes = await api.technicians.getAll();
      setTechnicians(techRes.data);
      if (techRes.data.length > 0) {
        setNewLog(prev => ({ ...prev, technician: techRes.data[0].name }));
      }
    } catch (err) {
      console.error('Error loading asset detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/public/assets/${id}`;
    navigator.clipboard.writeText(publicUrl);
    showToast('Public Asset link copied to clipboard!', 'success');
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleAddLogSubmit = async (e) => {
    e.preventDefault();
    if (!newLog.description || !newLog.cost || !newLog.downtimeMinutes) {
      showToast('Please fill out all fields.', 'warning');
      return;
    }

    try {
      await api.logs.create({
        assetId: id,
        type: newLog.type,
        description: newLog.description,
        technician: newLog.technician,
        cost: Number(newLog.cost),
        downtimeMinutes: Number(newLog.downtimeMinutes)
      });
      
      setShowAddLog(false);
      setNewLog({
        type: 'Preventive',
        description: '',
        technician: technicians[0]?.name || '',
        cost: '',
        downtimeMinutes: ''
      });
      showToast('Maintenance log recorded.', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to save log.', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Operational': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'Degraded': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'Critical': return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-blue-400" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Degraded': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Maintenance': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-450 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6">
        <div className="h-6 w-32 bg-slate-900 rounded shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-900/60 rounded-xl shimmer" />
          <div className="h-96 bg-slate-900/60 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex-1 text-center py-16 text-slate-400">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Asset Node Not Found</h3>
        <p className="text-xs mt-2">The scanned ID does not exist in the active register.</p>
        <Link to="/assets" className="mt-4 inline-block text-xs font-semibold text-violet-400 hover:underline">
          Back to assets catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <Link to="/assets" className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">Last Scanned: Today</span>
        </div>
      </div>

      {/* Asset Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Core Info & TIMELINE */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Specs Card */}
          <div className="glass-panel rounded-xl border border-slate-800 p-6 space-y-6 relative overflow-hidden">
            {/* Critical glow bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1
              ${asset.status === 'Critical' ? 'bg-rose-500' : asset.status === 'Maintenance' ? 'bg-blue-500' : 'bg-emerald-500'}
            `} />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-550 font-mono tracking-wider">{asset.id}</span>
                <h2 className="text-xl font-extrabold text-white mt-1 leading-tight">{asset.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-405">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusClass(asset.status)}`}>
                    {getStatusIcon(asset.status)}
                    <span>{asset.status}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-650" />
                    <span>{asset.location}</span>
                  </span>
                </div>
              </div>

              {/* Health Score Circle Gauge */}
              <div className="flex items-center gap-3 bg-slate-950/40 border border-slate-900 px-4 py-2.5 rounded-xl self-start">
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Health Rating</span>
                  <span className="text-xs font-mono font-semibold text-slate-400">Reliability index</span>
                </div>
                <div className={`text-2xl font-black font-mono leading-none ${
                  asset.health > 80 ? 'text-emerald-400' : asset.health > 60 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {asset.health}%
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-900/60 pt-4 text-xs">
              <button
                onClick={handleCopyPublicLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white font-medium transition-colors"
                title="Copy public asset profile link"
              >
                <Share2 className="w-3.5 h-3.5 text-violet-400" />
                <span>Copy Public Link</span>
              </button>
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white font-medium transition-colors"
                title="Open print label preview window"
              >
                <Printer className="w-3.5 h-3.5 text-violet-400" />
                <span>Print Label Preview</span>
              </button>
            </div>

            {/* Specifications Details Grid */}
            <div className="border-t border-slate-900/60 pt-5">
              <h3 className="text-xs font-bold uppercase text-slate-555 tracking-wide mb-3">Technical Specifications</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Model Number</span>
                  <span className="font-semibold text-slate-300 mt-1 block truncate">{asset.model || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Serial Number</span>
                  <span className="font-semibold text-slate-300 mt-1 block truncate font-mono">{asset.serialNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Install Date</span>
                  <span className="font-semibold text-slate-300 mt-1 block font-mono">{asset.installDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Criticality Tier</span>
                  <span className="font-semibold text-slate-300 mt-1 block">{asset.criticality}</span>
                </div>
              </div>

              {/* Custom key-values */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mt-4 pt-4 border-t border-slate-950/40">
                <div>
                  <span className="text-slate-500 block">Assigned Tech</span>
                  <span className="font-semibold text-slate-300 mt-1 block truncate">{asset.assignedTechnician || 'Unassigned'}</span>
                </div>
                {Object.entries(asset.specifications || {}).map(([key, val]) => (
                  <div key={key}>
                    <span className="text-slate-500 capitalize block">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-semibold text-slate-300 mt-1 block truncate">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Diagnostics Engine Output */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Cpu className="w-4 h-4 text-violet-400 animate-pulse-slow" />
              <h3 className="font-bold text-slate-200 text-sm">AI Recommendation Engine</h3>
            </div>

            {asset.aiAlert ? (
              <div className="space-y-4 bg-violet-600/5 border border-violet-500/25 p-4 rounded-lg">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className={`w-4.5 h-4.5 shrink-0 mt-0.5
                    ${asset.aiAlert.type === 'critical' ? 'text-rose-450 animate-pulse' : 'text-amber-400'}
                  `} />
                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">{asset.aiAlert.type} Diagnostic Anomaly</h4>
                    <p className="text-xs text-slate-350 mt-1 leading-relaxed">
                      {asset.aiAlert.message}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Suggested Preventive Measures</span>
                  <ul className="mt-1.5 space-y-1.5 text-xs text-slate-300">
                    {asset.aiAlert.actions.map((act, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-glow" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-lg text-xs text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Diagnostics nominal</h4>
                  <p className="text-slate-400 mt-0.5">Continuous telemetry logs verify standard vibrations, pressure gradients, and thermal values. No anomalies detected.</p>
                </div>
              </div>
            )}
          </div>

          {/* Asset Timeline Log */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-900">
              <h3 className="font-bold text-slate-200 text-sm">Asset Historical Lifecycle Timeline</h3>
              <button
                onClick={() => setShowAddLog(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                <span>Log Maintenance</span>
              </button>
            </div>

            <div className="relative pl-6 timeline-line space-y-6">
              
              {/* Professional timeline nodes */}
              <div className="relative text-xs">
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-500 shadow-glow" />
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-mono text-[10px] font-bold">{asset.installDate}</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.2 rounded font-bold uppercase">INSTALL</span>
                </div>
                <h4 className="font-bold text-slate-200 mt-1">Asset Created</h4>
                <p className="text-slate-500 mt-0.5">Node registered in MaintainIQ register. Baseline specifications established.</p>
              </div>

              {/* If degraded or under maintenance, show issue flags */}
              {(asset.status === 'Degraded' || asset.status === 'Critical' || asset.status === 'Maintenance') && (
                <div className="relative text-xs">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-rose-500 animate-pulse" />
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono text-[10px] font-bold">Recent Cycle</span>
                    <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.2 rounded font-bold uppercase">ALARM</span>
                  </div>
                  <h4 className="font-bold text-slate-200 mt-1">Telemetry Issue Reported</h4>
                  <p className="text-slate-500 mt-0.5">{asset.aiAlert ? asset.aiAlert.message : 'Vibration or pressure anomaly flagged by active monitors.'}</p>
                </div>
              )}

              {workOrders.length > 0 && workOrders.map(wo => (
                <div key={wo.id} className="relative text-xs">
                  <span className={`absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950
                    ${wo.status === 'Completed' ? 'bg-emerald-500' : 'bg-violet-650'}
                  `} />
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-mono text-[10px] font-bold">{wo.createdDate}</span>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.2 rounded font-bold uppercase">{wo.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-200 mt-1">Work Dispatch {wo.id}: {wo.title}</h4>
                  <p className="text-slate-500 mt-0.5">Assigned to tech. Progress logs registered in completion matrix.</p>
                </div>
              ))}

              {logs.map((log) => (
                <div key={log.id} className="relative text-xs">
                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 bg-violet-500 shadow-glow" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono font-semibold">{log.date}</span>
                      <span className="text-[9px] bg-slate-900 px-2 py-0.5 border border-slate-800 text-slate-300 rounded-full font-bold uppercase">
                        {log.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{log.technician}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        <span>${log.cost}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{log.downtimeMinutes}m down</span>
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mt-2 font-medium leading-relaxed bg-slate-950/20 p-2.5 rounded border border-slate-950">
                    {log.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Column: QR Code label, Service Schedule & Work Orders */}
        <div className="space-y-6">
          
          {/* QR Code Tag Box */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 text-center space-y-4">
            <h3 className="font-bold text-slate-200 text-sm text-left pb-2 border-b border-slate-900">QR Asset Label</h3>
            
            <div className="p-4 bg-white rounded-lg inline-block border border-slate-200 shadow-md">
              <QRCodeSVG
                value={asset.id}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            
            <div className="text-xs space-y-1">
              <span className="text-[10px] font-mono font-bold bg-slate-950 text-slate-300 px-2.5 py-0.5 rounded border border-slate-850">
                {asset.id}
              </span>
              <p className="text-[10px] text-slate-505 pt-1">Point physical tablet or smartphone scanner to log services immediately.</p>
            </div>
          </div>

          {/* Service Intervals */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 text-sm pb-2 border-b border-slate-900">Lifecycle Intervals</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Last Serviced</span>
                <span className="font-semibold text-slate-300 font-mono">{asset.lastServiceDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Next Due Service</span>
                <span className="font-semibold text-violet-400 font-mono">{asset.nextServiceDate}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-955/60">
                <span className="text-slate-500">Installation Date</span>
                <span className="font-semibold text-slate-300 font-mono">{asset.installDate}</span>
              </div>
            </div>
          </div>

          {/* Active Work Orders */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-200 text-sm pb-2 border-b border-slate-900">Open Dispatch Tickets</h3>
            
            {workOrders.length === 0 ? (
              <p className="text-slate-550 text-center py-2">No active work orders pending.</p>
            ) : (
              <div className="space-y-3">
                {workOrders.map(wo => (
                  <Link 
                    key={wo.id}
                    to="/work-orders"
                    className="block p-3 rounded-lg border border-slate-800 bg-slate-950/20 hover:bg-slate-900/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-slate-500 font-bold">{wo.id}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase
                        ${wo.priority === 'Emergency' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-400'}
                      `}>
                        {wo.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-300 mt-1 truncate">{wo.title}</h4>
                    <p className="text-[10px] text-slate-505 mt-0.5 truncate">{wo.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-950/40 text-[9px] text-slate-500">
                      <span>Status: <span className="font-bold text-slate-400">{wo.status}</span></span>
                      <span>Due: {wo.dueDate}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Log Maintenance Event Modal */}
      {showAddLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Record Service Maintenance</h3>
            
            <form onSubmit={handleAddLogSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Maintenance Type</label>
                  <select
                    value={newLog.type}
                    onChange={(e) => setNewLog({ ...newLog, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Preventive">Preventive</option>
                    <option value="Repair">Repair</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Calibration">Calibration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Technician</label>
                  <select
                    value={newLog.technician}
                    onChange={(e) => setNewLog({ ...newLog, technician: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Work/Repair Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detail the checklist, parts swapped, calibration logs, etc."
                  value={newLog.description}
                  onChange={(e) => setNewLog({ ...newLog, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Total Cost ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 250"
                    value={newLog.cost}
                    onChange={(e) => setNewLog({ ...newLog, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Downtime Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 45"
                    value={newLog.downtimeMinutes}
                    onChange={(e) => setNewLog({ ...newLog, downtimeMinutes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddLog(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/10 transition-all"
                >
                  Log Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Label Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-slide-up print:bg-white print:border-0 print:shadow-none print:w-full print:max-w-none print:p-8">
            
            {/* Close button - hidden in print */}
            <button 
              onClick={() => setShowPrintModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-800 print:border-black print:text-left print:hidden">
              <h3 className="font-bold text-white text-sm">Industrial QR Asset Label</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Physical label tag print configuration</p>
            </div>

            {/* Printable Frame Area */}
            <div id="printable-label-frame" className="my-6 p-6 bg-white border border-slate-200 rounded-xl inline-block text-black print:border-2 print:border-black print:my-0 print:w-[3.5in] print:h-[3.5in] print:flex print:flex-col print:items-center print:justify-center">
              <span className="text-[10px] font-bold text-violet-700 font-mono tracking-widest uppercase block print:text-black">MaintainIQ System</span>
              
              <div className="my-4 flex justify-center">
                <QRCodeSVG
                  value={asset.id}
                  size={150}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded print:bg-transparent print:border-0 print:p-0 font-bold">
                  {asset.id}
                </span>
                <h4 className="text-xs font-bold text-black mt-2 leading-tight">{asset.name}</h4>
                <p className="text-[9px] text-slate-600 font-medium">Loc: {asset.location}</p>
                <p className="text-[8px] text-slate-500 font-mono">Reg Date: {asset.installDate}</p>
              </div>
            </div>

            {/* Print actions - hidden in print */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4 print:hidden">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handlePrintLabel}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-650/15"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tag Label</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AssetDetail;
