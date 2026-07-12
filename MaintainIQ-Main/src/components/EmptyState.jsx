import React from 'react';
import { HelpCircle } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = HelpCircle, 
  title = 'No records found', 
  description = 'There are no active data entries registered in this directory.',
  actionText,
  onActionClick
}) => {
  return (
    <div className="p-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 flex flex-col items-center justify-center max-w-lg mx-auto">
      <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-slate-400 mb-4 shadow-inner">
        <Icon className="w-8 h-8 stroke-1.5" />
      </div>
      
      <h4 className="text-sm font-bold text-slate-350">{title}</h4>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed px-4">{description}</p>
      
      {actionText && (
        <button
          onClick={onActionClick}
          className="mt-5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-violet-650/15 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
