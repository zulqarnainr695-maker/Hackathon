import React, { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, User, Wrench, Shield, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const Technicians = () => {
  const [loading, setLoading] = useState(true);
  const [technicians, setTechnicians] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [assets, setAssets] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const techRes = await api.technicians.getAll();
      const woRes = await api.workOrders.getAll();
      const assetsRes = await api.assets.getAll();
      
      setTechnicians(techRes.data);
      setWorkOrders(woRes.data);
      setAssets(assetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTechActiveWO = (techId) => {
    return workOrders.filter(w => w.assignedTechId === techId && w.status !== 'Completed');
  };

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Wrench className="w-6 h-6 text-slate-400" />
          <span>Engineering Crew Directory</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage active dispatches, review skill certifications, and track task load profiles of technicians.</p>
      </div>

      {/* Grid of Crew Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 shimmer" />
          <div className="h-56 bg-slate-900/60 rounded-xl border border-slate-800 shimmer" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {technicians.map((tech) => {
            const activeWOs = getTechActiveWO(tech.id);
            return (
              <div 
                key={tech.id} 
                className="glass-panel rounded-xl border border-slate-800/85 p-6 flex flex-col justify-between space-y-4 hover:border-slate-700/60 transition-all relative overflow-hidden"
              >
                {/* Glowing decoration based on workload */}
                <div className={`absolute top-0 right-0 w-1.5 bottom-0
                  ${activeWOs.length >= 2 ? 'bg-amber-500' : activeWOs.length === 1 ? 'bg-blue-500' : 'bg-emerald-500'}
                `} />

                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <img 
                    src={tech.avatar} 
                    alt={tech.name} 
                    className="w-16 h-16 rounded-xl border border-slate-800 object-cover shrink-0"
                  />
                  
                  {/* Title Info */}
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white text-base truncate">{tech.name}</h3>
                    <p className="text-xs text-violet-400 font-semibold">{tech.role}</p>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase
                        ${activeWOs.length > 0 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }
                      `}>
                        <span className={`w-1 h-1 rounded-full ${activeWOs.length > 0 ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                        <span>{activeWOs.length > 0 ? 'Active Dispatch' : 'Available'}</span>
                      </span>

                      <span className="text-[10px] text-slate-550 font-bold bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-md">
                        Load: {activeWOs.length} Ticket(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* active dispatches preview list */}
                {activeWOs.length > 0 && (
                  <div className="border-t border-slate-900/60 pt-4 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Assigned Work Orders</span>
                    <div className="space-y-1.5 text-[11px] text-slate-350">
                      {activeWOs.map(wo => {
                        const asset = assets.find(a => a.id === wo.assetId);
                        return (
                          <div key={wo.id} className="flex items-center justify-between p-2 rounded bg-slate-950/40 border border-slate-950">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <span className="font-mono font-bold text-slate-500 shrink-0">{wo.id}</span>
                              <span className="font-semibold truncate">{wo.title}</span>
                            </div>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 font-bold uppercase
                              ${wo.priority === 'Emergency' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-900 text-slate-450'}
                            `}>
                              {wo.priority}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* contact stats */}
                <div className="flex items-center gap-4 text-[10px] text-slate-500 border-t border-slate-900/60 pt-3">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{tech.name.toLowerCase().replace(' ', '.')}@maintainiq.com</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+1 (555) 231-432{tech.id.substring(5)}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Technicians;
