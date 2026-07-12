import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Sparkles, 
  ListTodo, 
  AlertOctagon, 
  Check, 
  Edit, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

const AITriage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState('');
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editedTitle, setEditedTitle] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [editedPriority, setEditedPriority] = useState('');

  const handlePerformTriage = (e) => {
    e.preventDefault();
    if (!complaint.trim()) {
      showToast('Please type a descriptive mechanical complaint first.', 'warning');
      return;
    }

    setLoading(true);
    setTriageResult(null);

    // Simulate AI diagnostic calculation delay
    setTimeout(() => {
      const text = complaint.toLowerCase();
      let title = 'General Machinery Vibration & Wear Anomaly';
      let category = 'Manufacturing';
      let priority = 'Medium';
      let causes = [
        'Excessive load cycle rate or joint friction',
        'Fluid leakage or inadequate grease lubrication',
        'Component alignment fatigue due to anchor bolt slack'
      ];
      let checks = [
        'Measure temperature at key joint bearings',
        'Inspect seal integrity for fluid trace micro-leaks',
        'Tighten structure bolts and torque mounts to specifications'
      ];

      // Custom classifications matching keywords
      if (text.includes('hvac') || text.includes('compressor') || text.includes('ac') || text.includes('heat') || text.includes('cool')) {
        title = 'HVAC Compressor Valve Slack & Pressure Leak';
        category = 'HVAC Systems';
        priority = text.includes('smoke') || text.includes('hot') ? 'Critical' : 'High';
        causes = [
          'Compressor valve plate fatigue or gasket breakdown',
          'Low refrigerant volume causing cycle overheating',
          'Vibration isolation springs damaged'
        ];
        checks = [
          'Connect manifold gauges to verify suction & discharge pressures',
          'Log vibration frequencies at motor casing mounts',
          'Check system for refrigerant oil leak traces'
        ];
      } else if (text.includes('hydraulic') || text.includes('press') || text.includes('leak') || text.includes('fluid')) {
        title = 'Hydraulic Stamping Pressure Loss';
        category = 'Manufacturing';
        priority = text.includes('critical') || text.includes('burst') ? 'Critical' : 'High';
        causes = [
          'Main piston seal extrusion or structural tear',
          'Control valve solenoid failure or spool sticking',
          'Hydraulic oil degradation or high particle counts'
        ];
        checks = [
          'Verify fluid levels in hydraulic reservoir',
          'Inspect rod cylinder glands for wet oil traces',
          'Measure pump output pressure during full stroke sequence'
        ];
      } else if (text.includes('server') || text.includes('rack') || text.includes('network') || text.includes('it')) {
        title = 'IT Server Rack Node Overheating';
        category = 'IT Infrastructure';
        priority = 'High';
        causes = [
          'Chilled air supply blockage or fan tray fail',
          'High computing CPU utilization logs',
          'Ambient server room humidity threshold breach'
        ];
        checks = [
          'Check exhaust fan modules status indicators',
          'Verify server room AC system operation logs',
          'Scan node server temperature metrics'
        ];
      } else if (text.includes('robot') || text.includes('arm') || text.includes('axis') || text.includes('joint')) {
        title = 'Robotic Axis Joint Friction & Slip';
        category = 'Robotics';
        priority = 'High';
        causes = [
          'Axis-3 gearbox lubrication depletion',
          'Encoder cable shielding damage causing noise',
          'Payload limits exceeded during rapid movement sequence'
        ];
        checks = [
          'Inspect Axis-3 casing for grease spray traces',
          'Run standard calibration diagnostics routine',
          'Analyze joint current load logs'
        ];
      }

      setTriageResult({
        title,
        category,
        priority,
        causes,
        checks
      });

      setEditedTitle(title);
      setEditedCategory(category);
      setEditedPriority(priority);

      setLoading(false);
      showToast('AI Triage completed: diagnostic profile generated.', 'success');
    }, 1500);
  };

  const handleAccept = async () => {
    if (!triageResult) return;

    try {
      // Mock create a Work Order based on triage profile
      const newWO = {
        assetId: 'QR-HVAC-MC-001', // Standard fallback asset ID
        title: `AI Triage Dispatch: ${editedTitle}`,
        description: `AI Diagnosis Triage:\nSuggested causes: ${editedCategory}. ${triageResult.causes.join(', ')}\n\nInitial checklists:\n${triageResult.checks.map(c => `[ ] ${c}`).join('\n')}\n\nUser Description: ${complaint}`,
        priority: editedPriority === 'Critical' ? 'Emergency' : editedPriority,
        status: 'Assigned',
        assignedTechId: 'tech-2', // Default Sarah Jenkins
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      await api.workOrders.save(newWO);
      showToast('Triage accepted: Work Order dispatched successfully!', 'success');
      
      setTimeout(() => {
        navigate('/work-orders');
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('Failed to generate work order.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-violet-400" />
          <span>AI Issue Triage Center</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Diagnose complex mechanical complaints, map categories, estimate priorities, and auto-dispatch work order tags.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Complaint Box */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Telemetry Input</span>
          </h3>

          <form onSubmit={handlePerformTriage} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Enter Machinery Symptom Complaint</label>
              <textarea
                required
                rows="6"
                placeholder="Describe the anomalies, vibration sounds, or alarms here (e.g. 'The main HVAC unit on roof section 4 is making a loud squealing sound and isn't cooling properly...')"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-lg p-3 text-slate-350 placeholder-slate-650 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-lg shadow-violet-550/20 active:translate-y-0.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Analyzing Anomaly Data...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Perform AI Triage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: AI Triage profile */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4 shimmer h-96" />
          ) : !triageResult ? (
            <div className="p-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <Cpu className="w-12 h-12 text-slate-850 mx-auto mb-3" />
              Triage deck idle. Input mechanical complaints to trigger diagnostics.
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-5 animate-slide-up bg-slate-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-violet-600 to-indigo-500" />
              
              {/* Header Title editing */}
              <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-slate-900/60">
                <div className="space-y-1 w-full sm:w-2/3">
                  <span className="text-[9px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    AI Diagnosis Output
                  </span>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded p-1.5 text-xs text-white mt-1"
                    />
                  ) : (
                    <h3 className="font-bold text-white text-sm mt-1.5">{editedTitle}</h3>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className={`px-2 py-0.5 border rounded text-[9px] font-bold uppercase
                    ${editedPriority === 'Critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}
                  `}>
                    {editedPriority}
                  </span>
                  <span className="px-2 py-0.5 border border-slate-800 rounded bg-slate-900 text-slate-400 text-[9px] font-bold">
                    {editedCategory}
                  </span>
                </div>
              </div>

              {/* Editable Fields dropdowns */}
              {isEditing && (
                <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-3 rounded-lg border border-slate-850 animate-slide-down text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide text-[9px]">Edit Priority</label>
                    <select
                      value={editedPriority}
                      onChange={(e) => setEditedPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide text-[9px]">Edit Category</label>
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
                    >
                      <option value="HVAC Systems">HVAC Systems</option>
                      <option value="IT Infrastructure">IT Infrastructure</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Utility Systems">Utility Systems</option>
                      <option value="Robotics">Robotics</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Diagnosis possible causes */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[8.5px] block">Possible Failure Roots</span>
                <ul className="space-y-1.5 pl-3 list-disc text-slate-400">
                  {triageResult.causes.map((c, idx) => (
                    <li key={idx} className="leading-relaxed">{c}</li>
                  ))}
                </ul>
              </div>

              {/* Diagnostic initial checklist */}
              <div className="space-y-2 text-xs border-t border-slate-900/60 pt-4">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[8.5px] block flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5 text-violet-400" />
                  <span>Suggested Checks Checklist</span>
                </span>
                <div className="space-y-2 pl-1.5 text-slate-350">
                  {triageResult.checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/40 border border-slate-950">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Accept/Edit/Regenerate */}
              <div className="border-t border-slate-900/60 pt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5 text-violet-400" />
                    <span>{isEditing ? 'Save Edits' : 'Edit Output'}</span>
                  </button>
                  <button
                    onClick={handlePerformTriage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-350 hover:text-white text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-violet-400" />
                    <span>Regenerate</span>
                  </button>
                </div>

                <button
                  onClick={handleAccept}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow shadow-violet-550/15"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Accept & Dispatch</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AITriage;
