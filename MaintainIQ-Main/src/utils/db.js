// Mock Database using LocalStorage for persistence

const DEFAULT_TECHNICIANS = [
  { id: 'tech-1', name: 'Marcus Vance', role: 'Senior HVAC Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120' },
  { id: 'tech-2', name: 'Sarah Jenkins', role: 'Automation Engineer', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120' },
  { id: 'tech-3', name: 'Devon Carter', role: 'Electrical Specialist', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120' },
  { id: 'tech-4', name: 'Elena Rostova', role: 'Mechanical Systems Inspector', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120' }
];

const DEFAULT_ASSETS = [
  {
    id: 'QR-HVAC-MC-001',
    name: 'Carrier Main HVAC Compressor',
    category: 'HVAC Systems',
    status: 'Degraded', // Operational, Degraded, Critical, Maintenance
    health: 68,
    condition: 'Fair',
    assignedTechnician: 'Marcus Vance',
    location: 'Building A, Rooftop Section 4',
    model: 'Carrier WeatherMaker 50TC',
    serialNumber: 'SN-9821839218',
    installDate: '2022-04-12',
    lastServiceDate: '2026-05-10',
    nextServiceDate: '2026-07-20',
    criticality: 'High',
    specifications: {
      voltage: '460V',
      phase: '3-Phase',
      refrigerant: 'R-410A',
      capacity: '15 Tons'
    },
    aiAlert: {
      type: 'warning',
      message: 'Vibration frequency anomaly detected (14.2Hz deviation from nominal). Predictive failure model estimates compressor valve degradation in 18 days.',
      actions: ['Schedule internal valve inspection', 'Log pressure gauge measurements']
    }
  },
  {
    id: 'QR-SVR-RA-002',
    name: 'Dell PowerEdge Server Rack Alpha',
    category: 'IT Infrastructure',
    status: 'Operational',
    health: 98,
    condition: 'Excellent',
    assignedTechnician: 'Sarah Jenkins',
    location: 'Building B, Server Room 3',
    model: 'Dell PowerEdge R750 Custom Rack',
    serialNumber: 'SN-SVR-837198A',
    installDate: '2024-01-15',
    lastServiceDate: '2026-06-01',
    nextServiceDate: '2026-12-01',
    criticality: 'Critical',
    specifications: {
      powerCapacity: '12kW',
      upsBackup: 'APC Smart-UPS 5kVA',
      coolingLoad: '3.2 Tons',
      activeNodes: '18 Nodes'
    },
    aiAlert: null
  },
  {
    id: 'QR-HYD-PP3-003',
    name: 'Hydraulic Stamping Press P-3',
    category: 'Manufacturing',
    status: 'Critical',
    health: 39,
    condition: 'Poor',
    assignedTechnician: 'Elena Rostova',
    location: 'Assembly Hall 2, Station 7',
    model: 'Komatsu H1F200-2 Stamping Press',
    serialNumber: 'SN-PRESS-003-K',
    installDate: '2019-08-30',
    lastServiceDate: '2026-03-12',
    nextServiceDate: '2026-07-02', // Overdue
    criticality: 'Critical',
    specifications: {
      pressureMax: '200 Tons',
      strokeLength: '250mm',
      cycleRate: '45 SPM',
      oilCapacity: '400L'
    },
    aiAlert: {
      type: 'critical',
      message: 'Hydraulic pressure drop detected during downstroke (-12% threshold breach). Temperature is elevated at 78°C (limit: 70°C). Operational failure risk is high.',
      actions: ['Emergency seal replacement check', 'Hydraulic fluid top-off & analysis']
    }
  },
  {
    id: 'QR-GEN-G2-004',
    name: 'Caterpillar 500kVA Backup Generator Gen-2',
    category: 'Utility Systems',
    status: 'Operational',
    health: 89,
    condition: 'Good',
    assignedTechnician: 'Devon Carter',
    location: 'Exterior Yard, South Perimeter',
    model: 'CAT C15 ACERT Diesel',
    serialNumber: 'SN-GEN-500-CAT',
    installDate: '2021-11-20',
    lastServiceDate: '2026-06-15',
    nextServiceDate: '2026-09-15',
    criticality: 'High',
    specifications: {
      fuelCapacity: '1200 Gallons',
      outputVoltage: '480V',
      frequency: '60 Hz',
      oilPressure: '65 PSI'
    },
    aiAlert: {
      type: 'info',
      message: 'Coolant level is slowly trending downward over the last 30 operating hours. Action recommended at next scheduled check.',
      actions: ['Top off coolant fluid level', 'Inspect coolant system hoses for micro-leaks']
    }
  },
  {
    id: 'QR-ROB-RW7-005',
    name: 'Fanuc Robotic Welding Arm RW-7',
    category: 'Robotics',
    status: 'Maintenance',
    health: 72,
    condition: 'Good',
    assignedTechnician: 'Sarah Jenkins',
    location: 'Assembly Hall 1, Robotic Cell 4',
    model: 'Fanuc ARC Mate 120iD',
    serialNumber: 'SN-ROB-RW7-FNC',
    installDate: '2023-06-18',
    lastServiceDate: '2026-07-10',
    nextServiceDate: '2026-08-10',
    criticality: 'Medium',
    specifications: {
      payloadCapacity: '25kg',
      axes: '6 Axes',
      reach: '1811mm',
      controllerType: 'R-30iB Plus'
    },
    aiAlert: null
  }
];

const DEFAULT_MAINTENANCE_LOGS = [
  {
    id: 'log-1',
    assetId: 'QR-HVAC-MC-001',
    date: '2026-05-10',
    type: 'Preventive', // Preventive, Emergency, Repair, Installation
    description: 'Quarterly filter swap, fan belt tension adjustment, and refrigerant levels verification.',
    technician: 'Marcus Vance',
    cost: 320,
    downtimeMinutes: 45
  },
  {
    id: 'log-2',
    assetId: 'QR-HVAC-MC-001',
    date: '2026-02-15',
    type: 'Repair',
    description: 'Replaced faulty thermostat controller and recalibrated temperature sensors.',
    technician: 'Devon Carter',
    cost: 670,
    downtimeMinutes: 120
  },
  {
    id: 'log-3',
    assetId: 'QR-SVR-RA-002',
    date: '2026-06-01',
    type: 'Preventive',
    description: 'Dust cleaning, UPS battery test, cable management check, and fan redundancy confirmation.',
    technician: 'Sarah Jenkins',
    cost: 150,
    downtimeMinutes: 0
  },
  {
    id: 'log-4',
    assetId: 'QR-HYD-PP3-003',
    date: '2026-03-12',
    type: 'Repair',
    description: 'Resolved minor hydraulic hose leak and flushed cylinder line.',
    technician: 'Elena Rostova',
    cost: 1100,
    downtimeMinutes: 240
  },
  {
    id: 'log-5',
    assetId: 'QR-GEN-G2-004',
    date: '2026-06-15',
    type: 'Preventive',
    description: 'Semi-annual load bank testing, oil change, and diesel particulate filter cleanup.',
    technician: 'Elena Rostova',
    cost: 850,
    downtimeMinutes: 60
  }
];

const DEFAULT_WORK_ORDERS = [
  {
    id: 'WO-101',
    assetId: 'QR-HVAC-MC-001',
    title: 'HVAC Vibration Anomaly Check',
    description: 'Inspect the main compressor motor mounts and drive shaft alignment. Adjust belt tension if necessary. Check vibration level again.',
    priority: 'High', // Low, Medium, High, Emergency
    status: 'In Progress', // Backlog, Assigned, In Progress, Completed
    assignedTechId: 'tech-1',
    createdDate: '2026-07-09',
    dueDate: '2026-07-15',
    comments: [
      { sender: 'Marcus Vance', text: 'Checked mounts, they look stable. Preparing alignment tool.', date: '2026-07-10 14:30' }
    ]
  },
  {
    id: 'WO-102',
    assetId: 'QR-HYD-PP3-003',
    title: 'Emergency Hydraulic Seal Replacement',
    description: 'Diagnose the pressure loss in downstroke. Check seals at main cylinder, refill fluid reservoir and run system diagnostic check.',
    priority: 'Emergency',
    status: 'Assigned',
    assignedTechId: 'tech-4',
    createdDate: '2026-07-10',
    dueDate: '2026-07-12',
    comments: []
  },
  {
    id: 'WO-103',
    assetId: 'QR-GEN-G2-004',
    title: 'Inspect Coolant Fluid Levels & Hose Fittings',
    description: 'Perform visual inspection of coolant lines for cracks or slow leaks. Replenish coolant fluid level and log capacity change.',
    priority: 'Low',
    status: 'Backlog',
    assignedTechId: null,
    createdDate: '2026-07-11',
    dueDate: '2026-07-25',
    comments: []
  },
  {
    id: 'WO-104',
    assetId: 'QR-ROB-RW7-005',
    title: 'FANUC Robotic Axis-3 Recalibration',
    description: 'Calibrate Fanuc robotic arm following minor joint slip in welding sequence.',
    priority: 'Medium',
    status: 'Completed',
    assignedTechId: 'tech-2',
    createdDate: '2026-07-08',
    dueDate: '2026-07-11',
    comments: [
      { sender: 'Sarah Jenkins', text: 'Completed recalibration. Tested running 10 test welding sequences with zero errors.', date: '2026-07-10 11:15' }
    ]
  }
];

const DEFAULT_ISSUES = [
  {
    id: 'ISSUE-401',
    assetId: 'QR-HVAC-MC-001',
    title: 'Vibration frequency anomaly detected',
    description: 'Vibration frequency deviation (14.2Hz deviation from nominal). Predictive failure valves warning.',
    priority: 'High', // Emergency, High, Medium, Low
    status: 'Open', // Open, Assigned, Resolved
    reporterName: 'Elena Rostova',
    reporterEmail: 'admin@maintainiq.com',
    createdDate: '2026-07-10',
    assignedTechId: 'tech-1'
  },
  {
    id: 'ISSUE-402',
    assetId: 'QR-HYD-PP3-003',
    title: 'Hydraulic downstroke pressure loss',
    description: 'Hydraulic downstroke pressure limit breach (-12% threshold deviation) and elevated temperatures.',
    priority: 'Emergency',
    status: 'Assigned',
    reporterName: 'Elena Rostova',
    reporterEmail: 'admin@maintainiq.com',
    createdDate: '2026-07-11',
    assignedTechId: 'tech-4'
  },
  {
    id: 'ISSUE-403',
    assetId: 'QR-GEN-G2-004',
    title: 'Slow trending diesel coolant level drop',
    description: 'Generator Gen-2 diesel coolant trending down over last 30 operational check hours.',
    priority: 'Low',
    status: 'Open',
    reporterName: 'Marcus Vance',
    reporterEmail: 'tech@maintainiq.com',
    createdDate: '2026-07-11',
    assignedTechId: null
  }
];

// Initialize localStorage if empty
const initDB = () => {
  if (!localStorage.getItem('maintainiq_assets')) {
    localStorage.setItem('maintainiq_assets', JSON.stringify(DEFAULT_ASSETS));
  }
  if (!localStorage.getItem('maintainiq_logs')) {
    localStorage.setItem('maintainiq_logs', JSON.stringify(DEFAULT_MAINTENANCE_LOGS));
  }
  if (!localStorage.getItem('maintainiq_workorders')) {
    localStorage.setItem('maintainiq_workorders', JSON.stringify(DEFAULT_WORK_ORDERS));
  }
  if (!localStorage.getItem('maintainiq_technicians')) {
    localStorage.setItem('maintainiq_technicians', JSON.stringify(DEFAULT_TECHNICIANS));
  }
  if (!localStorage.getItem('maintainiq_issues')) {
    localStorage.setItem('maintainiq_issues', JSON.stringify(DEFAULT_ISSUES));
  }
};

initDB();

export const db = {
  // Assets
  getAssets: () => JSON.parse(localStorage.getItem('maintainiq_assets')),
  getAssetById: (id) => JSON.parse(localStorage.getItem('maintainiq_assets')).find(a => a.id === id),
  saveAsset: (asset) => {
    const assets = db.getAssets();
    const index = assets.findIndex(a => a.id === asset.id);
    if (index > -1) {
      assets[index] = asset;
    } else {
      assets.push(asset);
    }
    localStorage.setItem('maintainiq_assets', JSON.stringify(assets));
    return asset;
  },
  deleteAsset: (id) => {
    const assets = db.getAssets().filter(a => a.id !== id);
    localStorage.setItem('maintainiq_assets', JSON.stringify(assets));
  },

  // Issues
  getIssues: () => JSON.parse(localStorage.getItem('maintainiq_issues')),
  getIssueById: (id) => JSON.parse(localStorage.getItem('maintainiq_issues')).find(i => i.id === id),
  saveIssue: (issue) => {
    const issues = db.getIssues();
    const index = issues.findIndex(i => i.id === issue.id);
    if (index > -1) {
      issues[index] = issue;
    } else {
      issue.id = issue.id || `ISSUE-${Math.floor(400 + Math.random() * 599)}`;
      issue.createdDate = issue.createdDate || new Date().toISOString().split('T')[0];
      issue.status = issue.status || 'Open';
      issues.unshift(issue);
    }
    localStorage.setItem('maintainiq_issues', JSON.stringify(issues));
    return issue;
  },
  deleteIssue: (id) => {
    const issues = db.getIssues().filter(i => i.id !== id);
    localStorage.setItem('maintainiq_issues', JSON.stringify(issues));
  },

  // Logs
  getLogs: () => JSON.parse(localStorage.getItem('maintainiq_logs')),
  getLogsForAsset: (assetId) => JSON.parse(localStorage.getItem('maintainiq_logs')).filter(l => l.assetId === assetId),
  addLog: (log) => {
    const logs = db.getLogs();
    const newLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...log
    };
    logs.unshift(newLog);
    localStorage.setItem('maintainiq_logs', JSON.stringify(logs));
    
    // Update asset details if relevant (lastServiceDate)
    const assets = db.getAssets();
    const assetIndex = assets.findIndex(a => a.id === log.assetId);
    if (assetIndex > -1) {
      assets[assetIndex].lastServiceDate = newLog.date;
      // If asset was in maintenance or critical, reset its status to Operational
      if (assets[assetIndex].status === 'Maintenance' || assets[assetIndex].status === 'Critical') {
        assets[assetIndex].status = 'Operational';
        assets[assetIndex].health = Math.min(100, Math.floor(assets[assetIndex].health + 40));
        assets[assetIndex].aiAlert = null;
      }
      localStorage.setItem('maintainiq_assets', JSON.stringify(assets));
    }
    
    return newLog;
  },

  // Work Orders
  getWorkOrders: () => JSON.parse(localStorage.getItem('maintainiq_workorders')),
  getWorkOrderById: (id) => JSON.parse(localStorage.getItem('maintainiq_workorders')).find(w => w.id === id),
  saveWorkOrder: (wo) => {
    const wos = db.getWorkOrders();
    const index = wos.findIndex(w => w.id === wo.id);
    if (index > -1) {
      wos[index] = wo;
    } else {
      wo.id = wo.id || `WO-${Math.floor(100 + Math.random() * 900)}`;
      wo.createdDate = wo.createdDate || new Date().toISOString().split('T')[0];
      wo.comments = wo.comments || [];
      wos.push(wo);
    }
    localStorage.setItem('maintainiq_workorders', JSON.stringify(wos));
    
    // If work order is moved to In Progress or Completed, update the Asset Status accordingly
    const assets = db.getAssets();
    const assetIndex = assets.findIndex(a => a.id === wo.assetId);
    if (assetIndex > -1) {
      if (wo.status === 'Completed') {
        // Automatically log this as completed maintenance
        db.addLog({
          assetId: wo.assetId,
          type: wo.priority === 'Emergency' ? 'Emergency' : 'Repair',
          description: `Completed Work Order ${wo.id}: ${wo.title}. ${wo.description}`,
          technician: db.getTechnicians().find(t => t.id === wo.assignedTechId)?.name || 'System Operator',
          cost: Math.floor(Math.random() * 400 + 100),
          downtimeMinutes: wo.priority === 'Emergency' ? 180 : 60
        });
      } else if (wo.status === 'In Progress' && assets[assetIndex].status !== 'Maintenance') {
        assets[assetIndex].status = 'Maintenance';
        localStorage.setItem('maintainiq_assets', JSON.stringify(assets));
      }
    }

    return wo;
  },
  deleteWorkOrder: (id) => {
    const wos = db.getWorkOrders().filter(w => w.id !== id);
    localStorage.setItem('maintainiq_workorders', JSON.stringify(wos));
  },

  // Technicians
  getTechnicians: () => JSON.parse(localStorage.getItem('maintainiq_technicians')),
  
  // Reset DB
  resetDB: () => {
    localStorage.setItem('maintainiq_assets', JSON.stringify(DEFAULT_ASSETS));
    localStorage.setItem('maintainiq_logs', JSON.stringify(DEFAULT_MAINTENANCE_LOGS));
    localStorage.setItem('maintainiq_workorders', JSON.stringify(DEFAULT_WORK_ORDERS));
    localStorage.setItem('maintainiq_technicians', JSON.stringify(DEFAULT_TECHNICIANS));
    localStorage.setItem('maintainiq_issues', JSON.stringify(DEFAULT_ISSUES));
    return {
      assets: DEFAULT_ASSETS,
      logs: DEFAULT_MAINTENANCE_LOGS,
      workOrders: DEFAULT_WORK_ORDERS,
      technicians: DEFAULT_TECHNICIANS,
      issues: DEFAULT_ISSUES
    };
  }
};
