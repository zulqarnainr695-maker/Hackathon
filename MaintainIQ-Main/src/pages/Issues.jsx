import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle2, 
  Wrench, 
  User, 
  Cpu, 
  ArrowRight,
  ExternalLink,
  Edit,
  UserPlus,
  Check,
  LayoutGrid,
  List,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Skeletons';

const Issues = () => {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [assets, setAssets] = useState([]);

  // Layout and Assign Modals
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [assigningIssue, setAssigningIssue] = useState(null);
  const [selectedTechId, setSelectedTechId] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.issues.getAll();
      const techsRes = await api.technicians.getAll();
      const assetsRes = await api.assets.getAll();

      setIssues(res.data);
      setTechnicians(techsRes.data);
      setAssets(assetsRes.data);

      if (techsRes.data.length > 0) {
        setSelectedTechId(techsRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading issues database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assigningIssue || !selectedTechId) return;

    try {
      const tech = technicians.find(t => t.id === selectedTechId);
      const updatedIssue = { 
        ...assigningIssue, 
        status: 'Assigned',
        assignedTechId: selectedTechId
      };
      
      await api.issues.save(updatedIssue);
      
      // Auto-dispatch associated work order
      const customWO = {
        assetId: assigningIssue.assetId,
        title: `AI Assign: Resolve ${assigningIssue.title}`,
        description: `Investigate reported issue:\n${assigningIssue.description}\n\nReporter: ${assigningIssue.reporterName} (${assigningIssue.reporterEmail})`,
        priority: assigningIssue.priority === 'Emergency' ? 'Emergency' : assigningIssue.priority,
        status: 'Assigned',
        assignedTechId: selectedTechId,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      await api.workOrders.save(customWO);

      // Move asset status to Maintenance
      const assetRes = await api.assets.getById(assigningIssue.assetId);
      const asset = assetRes.data;
      asset.status = 'Maintenance';
      await api.assets.save(asset);

      showToast(`Issue assigned to ${tech.name}. Work Order dispatched.`, 'success');
      setAssigningIssue(null);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to assign technician.', 'error');
    }
  };

  const handleQuickResolve = async (issue) => {
    try {
      const updatedIssue = { ...issue, status: 'Resolved' };
      await api.issues.save(updatedIssue);

      // Update associated asset to Operational
      const assetRes = await api.assets.getById(issue.assetId);
      const asset = assetRes.data;
      asset.status = 'Operational';
      asset.health = Math.min(100, asset.health + 30);
      asset.aiAlert = null;
      await api.assets.save(asset);

      // Add safety service log
      await api.logs.create({
        assetId: issue.assetId,
        type: 'Repair',
        description: `Resolved reported issue: ${issue.title}. Verification testing successful.`,
        technician: technicians.find(t => t.id === issue.assignedTechId)?.name || 'System Operator',
        cost: 120,
        downtimeMinutes: 30
      });

      showToast('Issue marked as resolved. Asset status restored.', 'success');
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Failed to resolve issue.', 'error');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-450 border-slate-500/20';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Assigned': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Open': return 'bg-rose-500/10 text-rose-455 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-505/20';
    }
  };

  // Filter computation
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          issue.assetId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || issue.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
            <span>Telemetry Issues Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Review active anomaly logs, assign crew technicians, and mark resolved warnings.</p>
        </div>
        <Link
          to="/ai-triage"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-650 hover:bg-violet-550 text-white text-xs font-bold transition-all shadow-md shadow-violet-650/15 self-start"
        >
          <Cpu className="w-4 h-4" />
          <span>Autonomous AI Triage</span>
        </Link>
      </div>

      {/* Filter toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:w-80 flex items-center">
          <input
            type="text"
            placeholder="Search by code, title, asset ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-350 placeholder-slate-600 focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
        </div>

        <div className="w-full xl:w-auto flex flex-wrap items-center justify-between sm:justify-start gap-3">
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 text-xs text-slate-350 rounded-lg p-2 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Priorities</option>
            <option value="Emergency">Emergency</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 text-xs text-slate-350 rounded-lg p-2 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
          </select>

          <span className="hidden sm:inline w-px h-5 bg-slate-800/80 mx-1" />
          
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-850 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-violet-650/20 text-violet-400' : 'text-slate-550 hover:text-slate-300'}`}
              title="Show cards layout"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-violet-650/20 text-violet-400' : 'text-slate-550 hover:text-slate-300'}`}
              title="Show table rows layout"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Grid or Table layout list */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredIssues.length === 0 ? (
        <div className="p-16 text-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <CheckCircle2 className="w-12 h-12 text-emerald-500/80 mx-auto mb-3" />
          Clear directory. No active telemetry issues matches.
        </div>
      ) : viewMode === 'grid' ? (
        /* Render Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map((issue) => {
            const assetObj = assets.find(a => a.id === issue.assetId);
            const assignedTech = technicians.find(t => t.id === issue.assignedTechId);
            return (
              <div 
                key={issue.id} 
                className="glass-panel rounded-xl border border-slate-800 p-5 flex flex-col justify-between h-64 relative group bg-slate-950/25"
              >
                <div className={`absolute top-0 bottom-0 left-0 w-1
                  ${issue.priority === 'Emergency' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}
                `} />

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="font-mono font-bold text-slate-550">{issue.id}</span>
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${getPriorityClass(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase ${getStatusClass(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-200 text-sm truncate">{issue.title}</h3>
                  <p className="text-slate-400 text-xs leading-normal line-clamp-3">{issue.description}</p>
                </div>

                <div className="border-t border-slate-900/60 pt-3 mt-4 space-y-2 text-[11px] text-slate-500">
                  <div className="flex justify-between items-center">
                    <span>Machinery Node:</span>
                    <Link to={`/assets/${issue.assetId}`} className="font-semibold text-slate-350 hover:text-violet-400 hover:underline">
                      {assetObj ? assetObj.name : issue.assetId}
                    </Link>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Assigned Tech:</span>
                    <span className="font-semibold text-slate-350">
                      {assignedTech ? assignedTech.name : 'Unassigned'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-4">
                  <Link
                    to={`/assets/${issue.assetId}`}
                    className="p-1.5 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-400 flex items-center gap-1 text-[10px] font-bold"
                    title="Inspect asset details specs"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Specs</span>
                  </Link>

                  <div className="flex gap-2">
                    {issue.status === 'Open' && (
                      <button
                        onClick={() => setAssigningIssue(issue)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-violet-400 flex items-center gap-1"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Assign</span>
                      </button>
                    )}
                    {issue.status !== 'Resolved' && (
                      <button
                        onClick={() => handleQuickResolve(issue)}
                        className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-[10px] font-bold text-white flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Render Table Row List View */
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-4">Code</th>
                  <th className="p-4">Issue Title</th>
                  <th className="p-4">Asset ID</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Tech</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredIssues.map((issue) => {
                  const assignedTech = technicians.find(t => t.id === issue.assignedTechId);
                  return (
                    <tr key={issue.id} className="hover:bg-slate-900/15 transition-colors group">
                      <td className="p-4 font-mono font-bold text-slate-400">{issue.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-200 block max-w-[200px] truncate" title={issue.description}>
                          {issue.title}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link to={`/assets/${issue.assetId}`} className="font-mono text-violet-400 hover:underline">
                          {issue.assetId}
                        </Link>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getPriorityClass(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${getStatusClass(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        {assignedTech ? assignedTech.name : 'Unassigned'}
                      </td>
                      <td className="p-4 text-right space-x-1.5 shrink-0">
                        <Link
                          to={`/assets/${issue.assetId}`}
                          className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-450 inline-block align-middle"
                          title="Inspect Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {issue.status === 'Open' && (
                          <button
                            onClick={() => setAssigningIssue(issue)}
                            className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-450 inline-block align-middle"
                            title="Assign Crew"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {issue.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickResolve(issue)}
                            className="p-1 rounded hover:bg-slate-900 text-slate-455 hover:text-emerald-400 inline-block align-middle"
                            title="Quick Resolve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Crew Modal */}
      {assigningIssue && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Assign Dispatch Technician</h3>
              <button onClick={() => setAssigningIssue(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Select Technician Specialist</label>
                <select
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500 font-sans"
                >
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setAssigningIssue(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-250 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-650 hover:bg-violet-550 text-white font-bold rounded-lg"
                >
                  Dispatch Crew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Issues;
