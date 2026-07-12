import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Play,
  Check,
  User,
  Activity,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Skeletons';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [techName, setTechName] = useState('Marcus Vance');
  const [techId, setTechId] = useState('tech-1');
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);

  // Notes Modal state
  const [activeNotesWO, setActiveNotesWO] = useState(null);
  const [newComment, setNewComment] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('maintainiq_user'));
      
      // Default to Marcus Vance tech profile if logged in as tech
      let currentTechId = 'tech-1';
      let currentTechName = 'Marcus Vance';
      if (user && user.role === 'Technician') {
        currentTechName = user.name;
        // Search tech id
        const techsRes = await api.technicians.getAll();
        const matched = techsRes.data.find(t => t.name.toLowerCase() === user.name.toLowerCase());
        if (matched) {
          currentTechId = matched.id;
        }
      }
      setTechId(currentTechId);
      setTechName(currentTechName);

      const woRes = await api.workOrders.getAll();
      const assetsRes = await api.assets.getAll();

      // Filter work orders assigned to this tech
      const assignedWOs = woRes.data.filter(w => w.assignedTechId === currentTechId);
      setWorkOrders(assignedWOs);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error(err);
      showToast('Error loading work assignments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (wo, nextStatus) => {
    if (nextStatus === 'Completed') {
      // Direct the technician to the dedicated maintenance completion logging page!
      navigate(`/maintenance/${wo.id}`);
      return;
    }

    try {
      const updatedWO = { ...wo, status: nextStatus };
      await api.workOrders.save(updatedWO);
      showToast(`Work order status updated to '${nextStatus}'.`, 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to update status.', 'error');
    }
  };

  const handleAddCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeNotesWO) return;

    try {
      const updatedComments = [
        ...(activeNotesWO.comments || []),
        {
          sender: techName,
          text: newComment.trim(),
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ];

      const updatedWO = { ...activeNotesWO, comments: updatedComments };
      await api.workOrders.save(updatedWO);
      showToast('Assignment note added.', 'success');
      setNewComment('');
      setActiveNotesWO(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to add note.', 'error');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-450 border-slate-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'Assigned': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  // Metrics
  const pendingCount = workOrders.filter(w => w.status !== 'Completed').length;
  const completedCount = workOrders.filter(w => w.status === 'Completed').length;
  const todayJobsCount = workOrders.filter(w => w.dueDate === new Date().toISOString().split('T')[0] && w.status !== 'Completed').length;

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-violet-400" />
            <span>Technician Job Control</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Logged in as: <span className="font-semibold text-slate-300">{techName}</span>. Review assigned tasks and log completion notes.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1 bg-slate-950/20">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Pending Assignments</span>
          <h3 className="text-2xl font-black text-violet-450">{pendingCount} Tickets</h3>
          <p className="text-[10px] text-slate-550">Active dispatches in backlog or progress.</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1 bg-slate-950/20">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Today's Deadlines</span>
          <h3 className="text-2xl font-black text-rose-400">{todayJobsCount} Due</h3>
          <p className="text-[10px] text-slate-550">Tickets requiring immediate inspection.</p>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-1 bg-slate-950/20">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Completed Repairs</span>
          <h3 className="text-2xl font-black text-emerald-400">{completedCount} Resolved</h3>
          <p className="text-[10px] text-slate-550">Work logs closed in the current cycle.</p>
        </div>
      </div>

      {/* Main Jobs Listing */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : workOrders.length === 0 ? (
        <div className="p-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/80 mx-auto mb-3" />
          No work orders assigned. You are clear of dispatches.
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-violet-400" />
            <span>Active Dispatch List</span>
          </h3>

          <div className="space-y-4">
            {workOrders.map((wo) => {
              const asset = assets.find(a => a.id === wo.assetId);
              return (
                <div 
                  key={wo.id}
                  className={`glass-panel p-5 rounded-xl border flex flex-col lg:flex-row justify-between gap-5 relative overflow-hidden bg-slate-950/25
                    ${wo.status === 'Completed' ? 'border-emerald-500/10' : 'border-slate-800'}
                  `}
                >
                  <div className={`absolute top-0 bottom-0 left-0 w-1
                    ${wo.priority === 'Emergency' ? 'bg-rose-500 animate-pulse' : wo.status === 'Completed' ? 'bg-emerald-500' : 'bg-violet-500'}
                  `} />

                  {/* Left block details */}
                  <div className="space-y-2 lg:max-w-[65%]">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-slate-500">{wo.id}</span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getPriorityColor(wo.priority)}`}>
                        {wo.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusColor(wo.status)}`}>
                        {wo.status}
                      </span>
                      <span className="text-[10px] text-slate-550 font-semibold">• Due: {wo.dueDate}</span>
                    </div>

                    <h4 className="font-bold text-slate-200 text-sm">{wo.title}</h4>
                    <p className="text-slate-400 text-xs leading-normal">{wo.description}</p>
                    
                    {asset && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold bg-slate-950/40 p-2 rounded border border-slate-900/60 w-fit">
                        <span>Node: {asset.name} ({asset.id})</span>
                        <span>• Location: {asset.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-row lg:flex-col items-end justify-between lg:justify-center gap-3 shrink-0 self-stretch lg:self-center border-t lg:border-t-0 border-slate-900/60 pt-3 lg:pt-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveNotesWO(wo)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white"
                        title="Add/View internal dispatch comments"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/assets/${wo.assetId}`}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1 text-[10px] font-semibold"
                        title="Inspect asset specs and history"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">Inspect</span>
                      </Link>
                    </div>

                    {wo.status !== 'Completed' && (
                      <div className="flex items-center gap-2">
                        {wo.status === 'Assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(wo, 'In Progress')}
                            className="px-3 py-1.5 bg-violet-650 hover:bg-violet-550 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 shadow-md shadow-violet-650/10"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Job</span>
                          </button>
                        )}
                        {wo.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateStatus(wo, 'Completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold flex items-center gap-1 shadow-md shadow-emerald-600/10"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Close Ticket</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Comments Modal Overlay */}
      {activeNotesWO && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Dispatch Comments Ledger</h3>
              <button onClick={() => setActiveNotesWO(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* List current comments */}
            <div className="my-4 max-h-48 overflow-y-auto space-y-3.5 pr-1 text-xs">
              {(activeNotesWO.comments || []).length === 0 ? (
                <p className="text-slate-500 text-center py-4">No comments recorded on this dispatch yet.</p>
              ) : (
                activeNotesWO.comments.map((c, i) => (
                  <div key={i} className="bg-slate-950/40 p-2.5 rounded border border-slate-950 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-violet-400">{c.sender}</span>
                      <span className="text-slate-550 font-mono">{c.date}</span>
                    </div>
                    <p className="text-slate-350 leading-normal">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a comment */}
            <form onSubmit={handleAddCommentSubmit} className="space-y-4 pt-3 border-t border-slate-850 text-xs">
              <div>
                <label className="block text-slate-550 font-bold mb-1.5 uppercase tracking-wide">Write Note Description</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Type notes (e.g. 'Completed pump pressure tests, readings nominal. Mounting bolts tightened.')"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 placeholder-slate-650 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveNotesWO(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-650 hover:bg-violet-550 text-white font-bold rounded-lg"
                >
                  Post Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TechnicianDashboard;
