import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Cpu, 
  User, 
  Mail, 
  Camera, 
  Check, 
  ArrowLeft,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const ReportIssue = () => {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [evidenceName, setEvidenceName] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'HVAC Systems',
    priority: 'Medium',
    reporterName: '',
    reporterEmail: ''
  });

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await api.assets.getById(assetId);
        setAssetName(res.data.name);
        setForm(prev => ({ ...prev, category: res.data.category }));
      } catch (err) {
        console.error(err);
        setAssetName('Unknown Asset');
      }
    };
    if (assetId) fetchAsset();
  }, [assetId]);

  // Client-side AI prefill triage logic
  const handleAIGenerate = () => {
    if (!form.description.trim()) {
      showToast('Please type a detailed description of the issue first.', 'warning');
      return;
    }

    setIsAiGenerating(true);
    setTimeout(() => {
      const desc = form.description.toLowerCase();
      let suggestedCategory = form.category;
      let suggestedPriority = 'Medium';
      let suggestedTitle = form.title || 'Mechanical Fault Reported';

      if (desc.includes('compressor') || desc.includes('rattle') || desc.includes('hvac') || desc.includes('temp') || desc.includes('cool')) {
        suggestedCategory = 'HVAC Systems';
        suggestedPriority = desc.includes('smoke') || desc.includes('fire') || desc.includes('burst') ? 'Emergency' : 'High';
        suggestedTitle = 'HVAC Compressor Valve & Pressure Leak';
      } else if (desc.includes('hydraulic') || desc.includes('pressure') || desc.includes('leak') || desc.includes('seal') || desc.includes('fluid')) {
        suggestedCategory = 'Manufacturing';
        suggestedPriority = desc.includes('drop') || desc.includes('zero') ? 'Emergency' : 'High';
        suggestedTitle = 'Hydraulic Stamping Pressure Loss';
      } else if (desc.includes('server') || desc.includes('network') || desc.includes('rack') || desc.includes('node')) {
        suggestedCategory = 'IT Infrastructure';
        suggestedPriority = 'High';
        suggestedTitle = 'IT Server Node Overheat Alert';
      } else if (desc.includes('robot') || desc.includes('axis') || desc.includes('joint') || desc.includes('welding') || desc.includes('arm')) {
        suggestedCategory = 'Robotics';
        suggestedPriority = 'High';
        suggestedTitle = 'Robotic Axis Slip & Calibration Deviation';
      } else if (desc.includes('diesel') || desc.includes('generator') || desc.includes('power')) {
        suggestedCategory = 'Utility Systems';
        suggestedPriority = 'Emergency';
        suggestedTitle = 'Backup Generator Diesel Tank Fluid Warning';
      }

      setForm(prev => ({
        ...prev,
        title: suggestedTitle,
        category: suggestedCategory,
        priority: suggestedPriority
      }));

      setIsAiGenerating(false);
      showToast('AI Triage completed: suggested fields pre-filled.', 'info');
    }, 1200);
  };

  const handleFileUploadSim = (e) => {
    if (e.target.files && e.target.files[0]) {
      setEvidenceName(e.target.files[0].name);
      showToast('File selected: uploaded to telemetry evidence stack.', 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.reporterName || !form.reporterEmail) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      // Save reported issue in localStorage DB
      const newIssue = {
        assetId,
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        reporterName: form.reporterName,
        reporterEmail: form.reporterEmail,
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Open'
      };
      
      await api.issues.save(newIssue);
      
      // Update Asset Status to Degraded/Critical based on priority
      const assetRes = await api.assets.getById(assetId);
      const asset = assetRes.data;
      
      if (form.priority === 'Emergency') {
        asset.status = 'Critical';
        asset.health = Math.min(asset.health, 35);
      } else if (form.priority === 'High' && asset.status !== 'Critical') {
        asset.status = 'Degraded';
        asset.health = Math.min(asset.health, 65);
      }
      await api.assets.save(asset);

      showToast('Telemetry Issue flagged successfully.', 'success');
      
      setTimeout(() => {
        // Redirect back to Public Asset page or normal pages
        navigate(`/public/assets/${assetId}`);
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('Failed to log telemetry issue. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4">
      <div className="bg-glow-purple bottom-10 right-[15%] w-72 h-72 pointer-events-none" />

      {/* Brand Header */}
      <header className="max-w-xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-900">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm text-slate-200">MaintainIQ Issues Reporter</span>
        </div>
      </header>

      {/* Main Form container */}
      <main className="max-w-xl mx-auto w-full mt-8 flex-1">
        
        <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-6">
          
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Flag Telemetry Issue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Logging issue for machine node: <span className="font-semibold text-slate-350">{assetName} ({assetId})</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-400 font-bold uppercase tracking-wide">Problem Description *</label>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase disabled:opacity-50"
                  title="Use AI to scan details and classify categories"
                >
                  {isAiGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  ) : (
                    <Cpu className="w-3.5 h-3.5 text-violet-400" />
                  )}
                  <span>Generate AI Suggestion</span>
                </button>
              </div>
              <textarea
                required
                rows="4"
                placeholder="Detail what happened, e.g., 'The compressor is shaking violently and emitting a high-pitched grinding sound. Fluid level in main tank is slowly declining.'"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-3 text-slate-300 placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Issue Summary Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Compressor valve shaking violently"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-2.5 text-slate-300 placeholder-slate-650 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="HVAC Systems">HVAC Systems</option>
                  <option value="IT Infrastructure">IT Infrastructure</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Utility Systems">Utility Systems</option>
                  <option value="Robotics">Robotics</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Estimated Severity Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-305 focus:outline-none focus:border-violet-500"
                >
                  <option value="Low">Low (Maintenance)</option>
                  <option value="Medium">Medium (Caution)</option>
                  <option value="High">High (Alarm Warning)</option>
                  <option value="Emergency">Emergency (Immediate Dispatch)</option>
                </select>
              </div>
            </div>

            {/* Reporter Profile Details */}
            <div className="border-t border-slate-900/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Reporter Name *</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={form.reporterName}
                    onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2.5 text-slate-300 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Reporter Email Address *</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    placeholder="e.g. jdoe@factory.com"
                    value={form.reporterEmail}
                    onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2.5 text-slate-300 focus:outline-none font-mono"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mock Evidence Upload */}
            <div className="border-t border-slate-900/60 pt-4">
              <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Upload Photo / Audio Evidence</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
                  <Camera className="w-4 h-4 text-violet-400" />
                  <span>Choose file...</span>
                  <input
                    type="file"
                    accept="image/*,audio/*"
                    onChange={handleFileUploadSim}
                    className="hidden"
                  />
                </label>
                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                  {evidenceName || 'No file selected (Optional)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-850">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-lg bg-rose-650 hover:bg-rose-500 text-white font-bold transition-all shadow-md shadow-rose-600/10"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                <span>Submit Telemetry Issue</span>
              </button>
            </div>

          </form>

        </div>

      </main>

      <footer className="max-w-xl mx-auto w-full text-center mt-12 text-[10px] text-slate-650">
        MaintainIQ secure flag reporting engine. All sessions log telemetry timestamps.
      </footer>
    </div>
  );
};

export default ReportIssue;
