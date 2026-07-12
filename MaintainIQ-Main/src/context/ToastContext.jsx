import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-rose-455" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success': return 'border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)] bg-slate-900/90';
      case 'error': return 'border-rose-500/30 shadow-[0_0_15px_-5px_rgba(239,68,68,0.2)] bg-slate-900/90';
      case 'warning': return 'border-amber-500/30 shadow-[0_0_15px_-5px_rgba(245,158,11,0.2)] bg-slate-900/90';
      case 'info': return 'border-blue-500/30 shadow-[0_0_15px_-5px_rgba(59,130,246,0.2)] bg-slate-900/90';
      default: return 'border-slate-800/80 bg-slate-900/90';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Panel Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div 
            key={t.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border backdrop-blur-md text-xs text-slate-200 pointer-events-auto shadow-2xl transition-all duration-350 transform translate-y-0 translate-x-0 animate-slide-up
              ${getToastClass(t.type)}
            `}
            style={{
              animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div className="flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">{getToastIcon(t.type)}</span>
              <p className="font-semibold leading-normal font-sans">{t.message}</p>
            </div>
            <button 
              onClick={() => dismissToast(t.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded shrink-0 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
