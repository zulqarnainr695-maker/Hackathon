import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Wrench, 
  DollarSign, 
  Clock, 
  Camera, 
  FileText, 
  ArrowLeft,
  Calendar,
  Layers,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const LogMaintenance = () => {
  const { woId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [workOrder, setWorkOrder] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [evidenceName, setEvidenceName] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    inspectionNotes: '',
    workPerformed: '',
    replacementParts: '',
    cost: '',
    timeTaken: '',
    completionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchWODetails = async () => {
      try {
        setFetching(true);
        const woRes = await api.workOrders.getById(woId);
        setWorkOrder(woRes.data);
        
        const assetRes = await api.assets.getById(woRes.data.assetId);
        setAssetName(assetRes.data.name);

        // Pre-fill some inspection notes from the work order details
        setForm(prev => ({
          ...prev,
          inspectionNotes: `Inspected reported issue: ${woRes.data.title}. Checked components and fluid seals.`
        }));
      } catch (err) {
        console.error(err);
        showToast('Error loading work order details.', 'error');
      } finally {
        setFetching(false);
      }
    };
    fetchWODetails();
  }, [woId]);

  const handleFileUploadSim = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceName(e.target.files[0].name);
      showToast('Repair evidence uploaded.', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workPerformed || !form.cost || !form.timeTaken) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Log Maintenance activity
      const logData = {
        assetId: workOrder.assetId,
        type: workOrder.priority === 'Emergency' ? 'Emergency' : 'Repair',
        description: `Completed Work Order ${workOrder.id}: ${workOrder.title}.\nWork Performed: ${form.workPerformed}.\nParts used: ${form.replacementParts || 'None'}.\nInspection Notes: ${form.inspectionNotes}`,
        technician: 'Marcus Vance', // Default technician logging
        cost: Number(form.cost),
        downtimeMinutes: Number(form.timeTaken)
      };
      
      await api.logs.create(logData);

      // 2. Mark Work Order as completed
      const updatedWO = {
        ...workOrder,
        status: 'Completed',
        dueDate: form.completionDate,
        comments: [
          ...(workOrder.comments || []),
          {
            sender: 'Marcus Vance',
            text: `Closed Work Order. Work Performed: ${form.workPerformed}. Parts: ${form.replacementParts || 'None'}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16)
          }
        ]
      };
      await api.workOrders.save(updatedWO);

      // 3. Update Asset health rating back to nominal status
      const assetRes = await api.assets.getById(workOrder.assetId);
      const asset = assetRes.data;
      asset.status = 'Operational';
      asset.health = Math.min(100, Math.floor(asset.health + 45)); // Boost reliability index back
      asset.aiAlert = null;
      await api.assets.save(asset);

      showToast('Work Order completed and logged successfully.', 'success');
      
      setTimeout(() => {
        navigate('/technician-dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('Failed to complete maintenance work order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <span className="text-xs text-slate-500 mt-2">Loading ticket specifications...</span>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
        <p className="text-slate-500 text-sm">Work order ticket not found.</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-slate-900 text-slate-350 rounded-lg text-xs font-semibold">
          Return
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-3xl mx-auto">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to workstation</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          <span>Complete Maintenance Log</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Ticket: <span className="font-semibold text-slate-300">{workOrder.id} - {workOrder.title}</span>. Machinery: <span className="font-semibold text-slate-300">{assetName}</span></p>
      </div>

      {/* Grid container split layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left: Completion Form */}
        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-5 bg-slate-950/20">
          
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Inspection Notes */}
            <div>
              <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Inspection Notes</label>
              <textarea
                rows="3"
                value={form.inspectionNotes}
                onChange={(e) => setForm({ ...form, inspectionNotes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 focus:outline-none"
              />
            </div>

            {/* Work Performed */}
            <div>
              <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Work Performed Details *</label>
              <textarea
                required
                rows="3"
                placeholder="Describe actual repairs done (e.g. 'Flushed hydraulic system fluid line, replaced damaged cylinder oil seal...')"
                value={form.workPerformed}
                onChange={(e) => setForm({ ...form, workPerformed: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 focus:outline-none"
              />
            </div>

            {/* Replacement Parts */}
            <div>
              <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Replacement Parts Used</label>
              <input
                type="text"
                placeholder="e.g. Compressor Valve, R-410A Refrigerant"
                value={form.replacementParts}
                onChange={(e) => setForm({ ...form, replacementParts: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 focus:outline-none"
              />
            </div>

            {/* Cost, Time, Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Total Material Cost ($) *</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-300 focus:outline-none"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Duration (Minutes) *</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    required
                    placeholder="e.g. 90"
                    value={form.timeTaken}
                    onChange={(e) => setForm({ ...form, timeTaken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-300 focus:outline-none"
                  />
                  <Clock className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Completion Date *</label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={form.completionDate}
                    onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-300 focus:outline-none font-mono"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-slate-405 font-bold mb-1.5 uppercase tracking-wide">Evidence Upload Photo</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer">
                  <Camera className="w-4 h-4 text-violet-400" />
                  <span>Choose file...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUploadSim}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                  {evidenceName || 'No file selected (Optional)'}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4 border-t border-slate-850 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-md shadow-violet-650/15"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Submit Repair Report</span>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* Right: Job Status Timeline */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-violet-400" />
            <span>Ticket Progress Timeline</span>
          </h3>

          <div className="relative pl-5 border-l border-slate-900 space-y-5 text-xs text-slate-450 pt-2">
            
            {/* Step 1 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-slate-200 block">Work Order Assigned</span>
                <span className="text-[10px] text-slate-500 font-semibold">Assigned on: {workOrder.createdDate}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <span className={`absolute -left-[25px] top-0.5 w-3 h-3 rounded-full border border-slate-950 flex items-center justify-center
                ${workOrder.status === 'In Progress' || workOrder.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-900'}
              `}>
                {workOrder.status === 'In Progress' && <span className="w-1 h-1 rounded-full bg-white animate-ping" />}
              </span>
              <div className="space-y-0.5">
                <span className={`font-bold block ${workOrder.status === 'In Progress' || workOrder.status === 'Completed' ? 'text-slate-250' : 'text-slate-600'}`}>
                  Inspection Started
                </span>
                <span className="text-[10px] text-slate-550">Technician dispatched.</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <span className="absolute -left-[25px] top-0.5 w-3 h-3 rounded-full bg-violet-650 border border-slate-950 animate-pulse flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-white" />
              </span>
              <div className="space-y-0.5">
                <span className="font-bold text-violet-400 block">Closeout Submission</span>
                <span className="text-[10px] text-slate-550">Awaiting database logging submission.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default LogMaintenance;
