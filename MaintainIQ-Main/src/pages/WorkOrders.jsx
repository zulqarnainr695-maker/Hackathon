import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  User, 
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Wrench,
  X
} from 'lucide-react';
import { api } from '../services/api';

const WorkOrders = () => {
  const [loading, setLoading] = useState(true);
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  
  // Modals
  const [showAddWO, setShowAddWO] = useState(false);
  const [activeWO, setActiveWO] = useState(null);
  
  // New Work Order Form State
  const [newWO, setNewWO] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'Medium',
    assignedTechId: '',
    dueDate: ''
  });

  // Comment Form State
  const [commentText, setCommentText] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const woRes = await api.workOrders.getAll();
      setWorkOrders(woRes.data);

      const assetsRes = await api.assets.getAll();
      setAssets(assetsRes.data);
      if (assetsRes.data.length > 0) {
        setNewWO(prev => ({ ...prev, assetId: assetsRes.data[0].id }));
      }

      const techRes = await api.technicians.getAll();
      setTechnicians(techRes.data);
      if (techRes.data.length > 0) {
        setNewWO(prev => ({ ...prev, assignedTechId: techRes.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWOSubmit = async (e) => {
    e.preventDefault();
    if (!newWO.title || !newWO.description || !newWO.dueDate) {
      alert('Please fill out Title, Description, and Due Date');
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
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (wo, newStatus) => {
    try {
      const updated = { ...wo, status: newStatus };
      await api.workOrders.save(updated);
      
      // Update local state for modal immediately if open
      if (activeWO && activeWO.id === wo.id) {
        setActiveWO(prev => ({ ...prev, status: newStatus }));
      }
      
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeWO) return;

    const formattedComment = {
      sender: 'Elena Rostova',
      text: commentText.trim(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    const updatedWO = {
      ...activeWO,
      comments: [...(activeWO.comments || []), formattedComment]
    };

    try {
      await api.workOrders.save(updatedWO);
      setActiveWO(updatedWO);
      setCommentText('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      case 'Low': return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/25';
    }
  };

  const getTechnicianName = (techId) => {
    return technicians.find(t => t.id === techId)?.name || 'Unassigned';
  };

  const getTechnicianAvatar = (techId) => {
    return technicians.find(t => t.id === techId)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120';
  };

  // Grouping work orders by status
  const statuses = ['Backlog', 'Assigned', 'In Progress', 'Completed'];

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Work Orders Kanban</h2>
          <p className="text-xs text-slate-400 mt-1">Dispatch tickets to engineering crew, track tasks, and view live troubleshooting comments.</p>
        </div>
        <button
          onClick={() => setShowAddWO(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Dispatch Ticket</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-96 bg-slate-900/60 rounded-xl border border-slate-800 shimmer" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {statuses.map(columnStatus => {
            const columnWOs = workOrders.filter(w => w.status === columnStatus);
            return (
              <div 
                key={columnStatus}
                className="glass-panel border border-slate-800 rounded-xl p-4 flex flex-col min-h-[500px]"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full 
                      ${columnStatus === 'Backlog' ? 'bg-slate-500' : 
                        columnStatus === 'Assigned' ? 'bg-blue-500' : 
                        columnStatus === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'}
                    `} />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">{columnStatus}</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-950 px-2 py-0.5 border border-slate-800/80 text-slate-400 rounded-full font-mono">
                    {columnWOs.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {columnWOs.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-[11px] border border-dashed border-slate-900 rounded-lg">
                      Empty column
                    </div>
                  ) : (
                    columnWOs.map(wo => {
                      const asset = assets.find(a => a.id === wo.assetId);
                      return (
                        <div
                          key={wo.id}
                          onClick={() => setActiveWO(wo)}
                          className="p-4 rounded-lg bg-slate-900/40 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700/60 transition-all cursor-pointer group shadow-sm flex flex-col justify-between space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-slate-500 font-mono font-bold">{wo.id}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityClass(wo.priority)}`}>
                                {wo.priority}
                              </span>
                            </div>
                            
                            <h4 className="font-bold text-slate-200 text-xs mt-2 group-hover:text-white transition-colors truncate">
                              {wo.title}
                            </h4>
                            
                            <p className="text-[10px] text-slate-500 mt-1 truncate">
                              {asset ? asset.name : wo.assetId}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-900/60">
                            {/* Technician Avatar */}
                            <div className="flex items-center gap-1.5">
                              <img 
                                src={getTechnicianAvatar(wo.assignedTechId)} 
                                alt="Assigned tech avatar" 
                                className="w-5.5 h-5.5 rounded-full object-cover border border-slate-800"
                              />
                              <span className="text-[9px] text-slate-400 font-medium">
                                {getTechnicianName(wo.assignedTechId).split(' ')[0]}
                              </span>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                              <Calendar className="w-3 h-3 text-slate-650" />
                              <span>{wo.dueDate.substring(5)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Work Order Detail Modal */}
      {activeWO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl p-6 shadow-2xl relative animate-slide-up flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
            
            {/* Left section: Info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono font-bold">Ticket: {activeWO.id}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${getPriorityClass(activeWO.priority)}`}>
                  {activeWO.priority} Priority
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">{activeWO.title}</h3>
                <Link 
                  to={`/assets/${activeWO.assetId}`}
                  onClick={() => setActiveWO(null)}
                  className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold hover:underline block mt-1"
                >
                  Asset Ref: {activeWO.assetId} ({assets.find(a => a.id === activeWO.assetId)?.name})
                </Link>
              </div>

              <div className="bg-slate-950/40 border border-slate-950 p-3 rounded-lg text-xs text-slate-300 leading-relaxed font-sans min-h-[80px]">
                {activeWO.description}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Move Ticket State</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map(st => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(activeWO, st)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors
                        ${activeWO.status === st 
                          ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-650/15' 
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-850 hover:border-slate-800'
                        }
                      `}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assigned Tech Info */}
              <div className="p-3 bg-slate-950/20 border border-slate-800/60 rounded-lg flex items-center gap-3">
                <img 
                  src={getTechnicianAvatar(activeWO.assignedTechId)} 
                  alt="Technician avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-800"
                />
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Assigned Engineer</span>
                  <span className="text-xs font-bold text-slate-200 block">{getTechnicianName(activeWO.assignedTechId)}</span>
                </div>
              </div>
            </div>

            {/* Right section: Comments */}
            <div className="w-full md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-6 max-h-[450px]">
              <div className="flex flex-col flex-1 overflow-hidden">
                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-violet-400" />
                  <span>Crew Discussion</span>
                </h4>

                {/* Comments scrollable */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
                  {!activeWO.comments || activeWO.comments.length === 0 ? (
                    <p className="text-[11px] text-slate-650 italic text-center py-6">No discussions logged yet.</p>
                  ) : (
                    activeWO.comments.map((c, i) => (
                      <div key={i} className="text-[11px] bg-slate-950/40 p-2.5 rounded border border-slate-950 leading-relaxed font-sans">
                        <div className="flex items-center justify-between font-bold text-[10px] text-slate-400">
                          <span>{c.sender}</span>
                          <span className="font-mono text-slate-600 font-medium">{c.date.substring(5)}</span>
                        </div>
                        <p className="text-slate-300 mt-1 font-medium">{c.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comment submit */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Reply to ticket..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                >
                  Send
                </button>
              </form>

              {/* Close Button top-right (absolute) */}
              <button 
                onClick={() => setActiveWO(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-500 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add Work Order Modal */}
      {showAddWO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Create Dispatch Ticket</h3>
            
            <form onSubmit={handleCreateWOSubmit} className="space-y-4 text-xs">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Unassigned (Send to Backlog)</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.role.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Due Date *</label>
                <input
                  type="date"
                  required
                  value={newWO.dueDate}
                  onChange={(e) => setNewWO({ ...newWO, dueDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Troubleshooting Instructions *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Detail the failure signs, required checklists, and alignment parameters."
                  value={newWO.description}
                  onChange={(e) => setNewWO({ ...newWO, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
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
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-650/10 transition-all"
                >
                  Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrders;
