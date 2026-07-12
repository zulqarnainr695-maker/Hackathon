import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
      
      {/* Glow Orbs decoration */}
      <div className="bg-glow-purple top-[20%] left-[30%] pointer-events-none" />
      <div className="bg-glow-emerald bottom-[20%] right-[30%] pointer-events-none" />
      
      <div className="max-w-md w-full space-y-6 relative z-10 animate-fade-in">
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white">MaintainIQ</span>
        </div>

        {/* Indicator */}
        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 text-rose-500/80 shadow-inner mb-2 animate-pulse-slow">
          <AlertTriangle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight">404 - Node Not Registered</h2>
          <p className="text-xs text-slate-500 leading-relaxed px-6">
            The telemetry address or QR scanner redirect code does not match any node registered in Austin Facility database registry.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            to="/" 
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-lg shadow-violet-500/20 active:translate-y-0.5 transition-all"
          >
            Go to Command Center
          </Link>
        </div>

      </div>

    </div>
  );
};

export default NotFound;
