import React from 'react';

// Single Grid Card skeleton loading placeholder
export const CardSkeleton = () => (
  <div className="glass-panel rounded-xl border border-slate-800/80 p-5 space-y-4 h-56 relative overflow-hidden shimmer">
    <div className="flex items-start justify-between">
      <div className="space-y-2 w-2/3">
        <div className="h-2 w-12 bg-slate-800 rounded" />
        <div className="h-4 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-1/2" />
      </div>
      <div className="w-8 h-8 rounded bg-slate-800 shrink-0" />
    </div>
    
    <div className="space-y-2 mt-4">
      <div className="h-3 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-5/6" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
    </div>

    <div className="flex justify-between items-center border-t border-slate-900 pt-3 mt-4">
      <div className="h-4 bg-slate-800 rounded w-20" />
      <div className="h-4 bg-slate-800 rounded w-12" />
    </div>
  </div>
);

// Structured Table rows list skeleton
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-panel rounded-xl border border-slate-800/80 overflow-hidden shimmer">
    <div className="w-full text-left text-xs border-collapse">
      <div className="bg-slate-900/40 p-4 border-b border-slate-900 flex justify-between gap-4">
        <div className="h-3 bg-slate-800 rounded w-20" />
        <div className="h-3 bg-slate-800 rounded w-32" />
        <div className="h-3 bg-slate-800 rounded w-24" />
        <div className="h-3 bg-slate-800 rounded w-16" />
      </div>
      <div className="divide-y divide-slate-900">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="h-3 bg-slate-800 rounded w-16" />
            <div className="h-4 bg-slate-800 rounded w-36" />
            <div className="h-3 bg-slate-800 rounded w-20" />
            <div className="h-3 bg-slate-800 rounded w-28" />
            <div className="h-4 bg-slate-800 rounded w-12" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Specs Explorer details skeleton
export const DetailSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-4 bg-slate-800 rounded w-24" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-800/80 p-6 space-y-6">
        <div className="space-y-3">
          <div className="h-2 w-16 bg-slate-800 rounded" />
          <div className="h-6 w-1/3 bg-slate-800 rounded" />
          <div className="h-4 w-1/4 bg-slate-800 rounded" />
        </div>
        <div className="border-t border-slate-900 pt-6 space-y-4">
          <div className="h-3 w-16 bg-slate-800 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-2 bg-slate-800 rounded w-12" />
                <div className="h-3 bg-slate-800 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-panel rounded-xl border border-slate-800/80 p-5 flex flex-col items-center justify-center space-y-4">
        <div className="w-32 h-32 bg-slate-800 rounded-lg" />
        <div className="h-3 bg-slate-800 rounded w-20" />
      </div>
    </div>
  </div>
);
