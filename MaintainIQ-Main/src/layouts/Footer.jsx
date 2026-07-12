import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto py-6 px-8 border-t border-slate-900/60 bg-slate-950/20 text-slate-500 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span>© {new Date().getFullYear()} MaintainIQ Platform. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-500/80 animate-pulse-slow" />
            <span>AI Prediction Engine v2.4</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <div>
            <span>Local Mock Environment</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
