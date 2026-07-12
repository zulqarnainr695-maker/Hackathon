import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Gauge
} from 'lucide-react';
import { api } from '../services/api';

const AIInsights = () => {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  
  // Custom states for SVG chart interaction
  const [hoveredDataPoint, setHoveredDataPoint] = useState(null);

  // Mock telemetry data points for SVG Chart
  // Represents temperature trends of "Hydraulic Press P-3" over the past 7 days
  const telemetryData = [
    { day: 'Mon', temp: 58, vibration: 1.2, limit: 70 },
    { day: 'Tue', temp: 62, vibration: 1.3, limit: 70 },
    { day: 'Wed', temp: 60, vibration: 1.2, limit: 70 },
    { day: 'Thu', temp: 67, vibration: 1.8, limit: 70 },
    { day: 'Fri', temp: 74, vibration: 2.5, limit: 70 }, // Warning limit crossed
    { day: 'Sat', temp: 78, vibration: 3.1, limit: 70 }, // Critical limit crossed
    { day: 'Sun', temp: 79, vibration: 3.4, limit: 70 }  // Ongoing threshold breach
  ];

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await api.assets.getAll();
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  // Filter assets that have degrading health or active AI alerts
  const degradingAssets = assets.filter(a => a.health < 80);
  const anomalousAssetsCount = assets.filter(a => a.aiAlert).length;
  
  // System Health average
  const systemHealthScore = Math.round(assets.reduce((acc, c) => acc + c.health, 0) / assets.length) || 0;

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-violet-400 animate-pulse-slow" />
            <span>AI Predictive Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Autonomous diagnostics, telemetry monitoring, and machine-learning schedule optimization.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-650/15 border border-violet-500/30 text-violet-300 text-xs rounded-full font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Models Synced</span>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Core health metric */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Predictive System Index</span>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold ${systemHealthScore > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {systemHealthScore}%
            </h3>
            <span className="text-xs text-slate-400 font-medium">Aggregate score</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">Operational reliability score calculated from vibration sensors and load bank trends.</p>
        </div>

        {/* Anomaly triggers */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Telemetry Alerts</span>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-extrabold ${anomalousAssetsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {anomalousAssetsCount} Triggered
            </h3>
            <span className="text-xs text-slate-400 font-medium">Active alarms</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">Nodes reporting threshold breaches (excessive temperature deviation or vibration harmonics).</p>
        </div>

        {/* Next failure date prediction */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mean Time to Failure (MTTF)</span>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-white">18 Days</h3>
            <span className="text-xs text-slate-400 font-medium">Estimated</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">Calculated earliest component fail date: **Carrier HVAC Unit 001** (Compressor mount joint fatigue).</p>
        </div>
      </div>

      {/* Charts & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Telemetry Visual SVG Chart & Schedule Optimization */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SVG Telemetry trend chart */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-3">
              <div>
                <h3 className="font-bold text-slate-200 text-sm">Critical Telemetry Stream</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Hydraulic press temperature & vibration harmonics (Last 7 Days)</p>
              </div>
              
              <div className="flex items-center gap-3 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-violet-400 inline-block" />
                  <span>Temperature (°C)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-0.5 bg-rose-500 border border-dashed inline-block" />
                  <span>Limit (70°C)</span>
                </div>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="relative pt-4">
              <svg 
                viewBox="0 0 500 200" 
                className="w-full h-48 overflow-visible"
              >
                {/* Horizontal grid lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="60" x2="480" y2="60" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="100" x2="480" y2="100" stroke="#1e293b" strokeWidth="1" /> {/* Limit Line indicator */}
                <line x1="40" y1="140" x2="480" y2="140" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#334155" strokeWidth="1" />

                {/* Y Axis labels */}
                <text x="15" y="24" fill="#64748b" className="text-[9px] font-mono">100°C</text>
                <text x="15" y="64" fill="#64748b" className="text-[9px] font-mono">80°C</text>
                <text x="15" y="104" fill="#f43f5e" className="text-[9px] font-mono font-bold">70°C</text>
                <text x="15" y="144" fill="#64748b" className="text-[9px] font-mono">50°C</text>
                <text x="15" y="184" fill="#64748b" className="text-[9px] font-mono">30°C</text>

                {/* Dotted limit line highlighted */}
                <line x1="40" y1="100" x2="480" y2="100" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5,5" opacity="0.6" />

                {/* Temperature Data Line Path */}
                {/* Math mapping: range 30C to 100C => y mapping 180 to 20 */}
                {/* formula: y = 180 - ((temp - 30) / 70) * 160 */}
                <path
                  d="M 60 116 L 125 106 L 190 111 L 255 95 L 320 79 L 385 70 L 450 67"
                  fill="none"
                  stroke="url(#purpleGrad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a78bfa" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>

                {/* Data Points Dots */}
                {[
                  { x: 60, y: 116, ...telemetryData[0] },
                  { x: 125, y: 106, ...telemetryData[1] },
                  { x: 190, y: 111, ...telemetryData[2] },
                  { x: 255, y: 95, ...telemetryData[3] },
                  { x: 320, y: 79, ...telemetryData[4] },
                  { x: 385, y: 70, ...telemetryData[5] },
                  { x: 450, y: 67, ...telemetryData[6] }
                ].map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredDataPoint?.day === pt.day ? 6.5 : 4.5}
                    fill={pt.temp >= 70 ? '#f43f5e' : '#8b5cf6'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredDataPoint(pt)}
                    onMouseLeave={() => setHoveredDataPoint(null)}
                  />
                ))}

                {/* X Axis labels */}
                <text x="60" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Mon</text>
                <text x="125" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Tue</text>
                <text x="190" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Wed</text>
                <text x="255" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Thu</text>
                <text x="320" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Fri</text>
                <text x="385" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Sat</text>
                <text x="450" y="195" fill="#64748b" className="text-[9px] text-center font-mono" textAnchor="middle">Sun</text>
              </svg>

              {/* Tooltip Overlay */}
              {hoveredDataPoint && (
                <div 
                  className="absolute bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] shadow-xl pointer-events-none space-y-1 animate-fade-in"
                  style={{
                    left: `${(hoveredDataPoint.x / 500) * 100}%`,
                    top: `${(hoveredDataPoint.y / 200) * 100 - 35}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="font-bold text-slate-200">{hoveredDataPoint.day} Status</div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Temp:</span>
                    <span className={`font-mono font-semibold ${hoveredDataPoint.temp >= 70 ? 'text-rose-400' : 'text-violet-400'}`}>
                      {hoveredDataPoint.temp}°C
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Vibration:</span>
                    <span className="font-mono text-slate-300">{hoveredDataPoint.vibration}mm/s</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Schedule Optimization Recommendation */}
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <h3 className="font-bold text-slate-200 text-sm">Cluster Scheduling Recommendations</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 md:max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-600/20 text-violet-300 font-bold uppercase">Optimization Target</span>
                    <span className="text-[10px] text-slate-500 font-bold">Route Savings: $150.00</span>
                  </div>
                  <h4 className="font-bold text-slate-200">Joint Service Opportunity: HVAC Unit 001 + Backup Generator 004</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    AI predicts technician dispatch on HVAC Unit 001 within 8 days. Generator 004 has scheduled service in 14 days. Cluster maintenance window to 2026-07-20 to save transit and double machinery downtime fees.
                  </p>
                </div>
                <Link 
                  to="/work-orders" 
                  className="px-3 py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/10 transition-colors inline-block text-center shrink-0"
                >
                  Adjust Schedules
                </Link>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-70">
                <div className="space-y-1 md:max-w-[70%]">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-900 border border-slate-850 text-slate-500 font-bold uppercase">Routine Calibration</span>
                    <span className="text-[10px] text-slate-500 font-bold">Confidence: 94%</span>
                  </div>
                  <h4 className="font-bold text-slate-300">Predictive Part Order: Robotic Welder joint oil seal</h4>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Axis-3 lubrication telemetry indicates slow decay. Autogenerate parts purchase request for Fanuc seal kit type SF-32 to match planned August overhaul.
                  </p>
                </div>
                <span className="text-slate-500 font-semibold italic text-[11px] shrink-0 text-center">Part Dispatched</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Degrading Assets Health Checklist */}
        <div className="space-y-6">
          <div className="glass-panel rounded-xl border border-slate-800 p-5 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm pb-2 border-b border-slate-900">Degrading Asset Nodes</h3>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 bg-slate-900/60 rounded shimmer" />
                <div className="h-12 bg-slate-900/60 rounded shimmer" />
              </div>
            ) : degradingAssets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs bg-slate-950/20 border border-slate-900 rounded-lg">
                All connected nodes reporting health index &gt; 80%.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {degradingAssets.map(a => (
                  <div 
                    key={a.id}
                    className="p-3 bg-slate-950/30 border border-slate-850 rounded-lg space-y-2 hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <Link to={`/assets/${a.id}`} className="font-bold text-slate-350 hover:text-violet-400 truncate max-w-[140px]">
                        {a.name}
                      </Link>
                      <span className={`font-mono font-bold ${a.health < 50 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                        {a.health}% HP
                      </span>
                    </div>

                    {/* Progress Health */}
                    <div className="w-full bg-slate-900 rounded-full h-1 border border-slate-850">
                      <div 
                        className={`h-full rounded-full ${a.health < 50 ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${a.health}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Status: <span className="font-semibold">{a.status}</span></span>
                      <Link to={`/assets/${a.id}`} className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Info Card details */}
          <div className="glass-panel rounded-xl border border-slate-850 p-5 space-y-3.5 text-xs text-slate-400">
            <h3 className="font-bold text-slate-200 text-sm pb-1.5 border-b border-slate-900 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-violet-400" />
              <span>Model Parameters</span>
            </h3>
            <p className="leading-relaxed text-[11px]">
              Platform diagnostic predictions run on a convolutional neural network (CNN) analyzing high-frequency vibrational vectors (Hz) and thermo-coupler temperature signals (deg C).
            </p>
            <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span>Inference Rate</span>
                <span className="font-mono text-slate-300">0.05ms</span>
              </div>
              <div className="flex justify-between">
                <span>Model Accuracy</span>
                <span className="font-mono text-slate-300">98.2% F1-score</span>
              </div>
              <div className="flex justify-between">
                <span>Telemetry Nodes</span>
                <span className="font-mono text-slate-300">48 Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AIInsights;
