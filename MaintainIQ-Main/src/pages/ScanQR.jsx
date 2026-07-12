import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  HelpCircle,
  HardDrive,
  Cpu,
  RefreshCw,
  Search,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

const ScanQR = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [manualInputId, setManualInputId] = useState('');
  
  // Scanning state animation
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const loadAssets = async () => {
    try {
      setLoading(true);
      const res = await api.assets.getAll();
      setAssets(res.data);
      if (res.data.length > 0) {
        setSelectedAssetId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();

    // Check if qrId is passed in URL to trigger auto-scan simulation
    const autoQrId = searchParams.get('qrId');
    if (autoQrId) {
      setManualInputId(autoQrId);
      triggerScan(autoQrId);
    }
  }, [searchParams]);

  const triggerScan = (qrCodeId) => {
    if (!qrCodeId) return;
    
    setIsScanning(true);
    setScanStatus('Initializing simulated camera lens...');
    
    // Simulate steps in scanning with micro-delays
    setTimeout(() => {
      setScanStatus('Targeting bounding boxes...');
      setTimeout(() => {
        setScanStatus('Decoding matrix layers...');
        setTimeout(() => {
          setScanStatus('Authenticating asset node credentials...');
          setTimeout(() => {
            setIsScanning(false);
            setScanStatus('');
            navigate(`/assets/${qrCodeId}`);
          }, 600);
        }, 500);
      }, 500);
    }, 600);
  };

  const handleSelectScanSubmit = (e) => {
    e.preventDefault();
    triggerScan(selectedAssetId);
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!manualInputId.trim()) return;
    triggerScan(manualInputId.trim().toUpperCase());
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-6">
      
      {/* Background glowing gradients */}
      <div className="bg-glow-purple top-1/4 left-1/3" />

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Left/Middle Column (Viewfinder box) */}
        <div className="md:col-span-7 flex flex-col justify-between glass-panel border-slate-800 rounded-xl p-5 aspect-square max-w-[380px] mx-auto md:max-w-none md:w-full">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-violet-400" />
              <span>Simulated Viewfinder</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Focus QR code boundary labels inside indicator grids.</p>
          </div>

          {/* Viewfinder Target Frame Box */}
          <div className="relative flex-1 my-4 rounded-lg bg-slate-950 border border-slate-900 overflow-hidden flex flex-col items-center justify-center">
            
            {/* Viewfinder Corners */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-violet-500 rounded-tl" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-violet-500 rounded-tr" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-violet-500 rounded-bl" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-violet-500 rounded-br" />

            {/* Laser scanning vertical animation line */}
            {isScanning && (
              <div 
                className="absolute left-4 right-4 h-0.5 bg-violet-500/80 shadow-[0_0_12px_rgba(139,92,246,0.8)] animate-pulse"
                style={{
                  top: '10%',
                  animation: 'scanLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  keyframes: `
                    @keyframes scanLine {
                      0% { top: 10% }
                      50% { top: 90% }
                      100% { top: 10% }
                    }
                  `
                }}
              />
            )}

            {isScanning ? (
              <div className="text-center p-6 space-y-4 max-w-[80%]">
                <RefreshCw className="w-10 h-10 text-violet-500 mx-auto animate-spin" />
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-350 uppercase tracking-widest block">Scanning QR Code</span>
                  <span className="text-[10px] text-slate-500 font-medium block animate-pulse">{scanStatus}</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3 text-slate-600">
                <QrCode className="w-16 h-16 mx-auto stroke-1 text-slate-800" />
                <p className="text-[11px] max-w-[80%] mx-auto leading-relaxed">
                  Select a machinery node or input code string on the sidebar control panel to trigger diagnostics.
                </p>
              </div>
            )}
          </div>

          <div className="text-center text-[10px] text-slate-500">
            <span>Powered by MaintainIQ Lens Decoders</span>
          </div>
        </div>

        {/* Right Column (Control Panel selectors) */}
        <div className="md:col-span-5 flex flex-col justify-between gap-4">
          
          {/* Pick Asset to scan list */}
          <div className="glass-panel border-slate-850 rounded-xl p-5 space-y-4 flex-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
              Pick Asset Node
            </h4>
            
            {loading ? (
              <div className="h-8 bg-slate-950 rounded shimmer" />
            ) : (
              <form onSubmit={handleSelectScanSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Select Registered Asset</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    disabled={isScanning}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500 text-xs font-medium"
                  >
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                    ))}
                  </select>
                </div>
                
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/10 active:translate-y-0.5 transition-all text-xs disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Scan Selected Asset</span>
                </button>
              </form>
            )}
          </div>

          {/* Manual ID scanner input */}
          <div className="glass-panel border-slate-850 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-2 border-b border-slate-900">
              Manual Asset Code
            </h4>
            
            <form onSubmit={handleManualScanSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 uppercase tracking-wide">Asset Tag QR ID</label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    disabled={isScanning}
                    placeholder="e.g. QR-HVAC-MC-001"
                    value={manualInputId}
                    onChange={(e) => setManualInputId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 rounded-lg pl-8 pr-3 py-2 text-xs font-mono font-bold text-slate-350 placeholder-slate-650 focus:outline-none transition-colors"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isScanning || !manualInputId.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold transition-all text-xs disabled:opacity-50"
              >
                <span>Diagnose ID Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Embedded inline CSS for the scan animation */}
      <style>{`
        @keyframes scanLine {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  );
};

export default ScanQR;
