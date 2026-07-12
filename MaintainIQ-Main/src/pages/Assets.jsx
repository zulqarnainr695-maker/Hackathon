import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  QrCode, 
  Plus, 
  Activity, 
  MapPin, 
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  HelpCircle,
  ExternalLink,
  LayoutGrid,
  List,
  Edit,
  Trash2,
  User,
  Heart,
  Calendar,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

const Assets = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [locations, setLocations] = useState(['All']);
  const [technicians, setTechnicians] = useState([]);
  
  // Toggles and Modals
  const [viewMode, setViewMode] = useState('grid'); // grid or table
  const [activeQRAsset, setActiveQRAsset] = useState(null);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAddAsset, setShowAddAsset] = useState(false);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Form states
  const [newAsset, setNewAsset] = useState({
    assetCode: '',
    name: '',
    category: 'HVAC Systems',
    location: '',
    model: '',
    serialNumber: '',
    criticality: 'Medium',
    condition: 'Good',
    assignedTechnician: ''
  });

  const [editForm, setEditForm] = useState({
    _id: '',
    id: '',
    name: '',
    category: '',
    location: '',
    model: '',
    serialNumber: '',
    criticality: '',
    condition: '',
    assignedTechnician: '',
    health: 100,
    status: 'Operational'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.assets.getAll();
      const techRes = await api.technicians.getAll();
      
      const assetList = res.data;
      setAssets(assetList);
      setTechnicians(techRes.data);

      if (techRes.data.length > 0) {
        setNewAsset(prev => ({ ...prev, assignedTechnician: techRes.data[0].name }));
      }
      
      // Calculate filters lists
      const distinctCategories = ['All', ...new Set(assetList.map(a => a.category))];
      setCategories(distinctCategories);

      // Clean locations for filtering (strip specific section numbers, e.g., 'Building A')
      const distinctLocations = ['All', ...new Set(assetList.map(a => a.location.split(',')[0].trim()))];
      setLocations(distinctLocations);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Operational': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Degraded': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'Critical': return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case 'Maintenance': return <Wrench className="w-3.5 h-3.5 text-blue-400" />;
      default: return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Operational': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Degraded': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Maintenance': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent': return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
      case 'Good': return 'text-teal-400 bg-teal-500/5 border-teal-500/10';
      case 'Fair': return 'text-amber-400 bg-amber-500/5 border-amber-500/10';
      case 'Poor': return 'text-rose-400 bg-rose-500/5 border-rose-500/10 animate-pulse';
      default: return 'text-slate-400 bg-slate-500/5 border-slate-550/10';
    }
  };

  // Add Asset Handler
  const handleAddAssetSubmit = async (e) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.location) {
      alert('Please fill out Name and Location');
      return;
    }

    const generatedId = newAsset.assetCode.trim() 
      ? newAsset.assetCode.trim().toUpperCase()
      : `QR-${newAsset.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 950)}`;

    const assetToSave = {
      id: generatedId,
      ...newAsset,
      status: 'Operational',
      health: 100,
      installDate: new Date().toISOString().split('T')[0],
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specifications: {
        power: 'Standard',
        operationalRating: 'Grade A'
      },
      aiAlert: null
    };

    try {
      await api.assets.save(assetToSave);
      setShowAddAsset(false);
      setNewAsset({
        assetCode: '',
        name: '',
        category: 'HVAC Systems',
        location: '',
        model: '',
        serialNumber: '',
        criticality: 'Medium',
        condition: 'Good',
        assignedTechnician: technicians[0]?.name || ''
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Asset Trigger
  const handleEditClick = (asset) => {
    setEditForm({
      _id: asset._id,
      id: asset.id,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      model: asset.model || '',
      serialNumber: asset.serialNumber || '',
      criticality: asset.criticality || 'Medium',
      condition: asset.condition || 'Good',
      assignedTechnician: asset.assignedTechnician || '',
      health: asset.health || 100,
      status: asset.status || 'Operational',
      installDate: asset.installDate,
      lastServiceDate: asset.lastServiceDate,
      nextServiceDate: asset.nextServiceDate,
      specifications: asset.specifications || {},
      aiAlert: asset.aiAlert || null
    });
    setEditingAsset(asset);
  };

  // Save Edit Handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Dynamic adjustments based on status changes (resets alerts if status operational)
      const adjustedForm = { ...editForm };
      if (editForm.status === 'Operational') {
        adjustedForm.health = 100;
        adjustedForm.aiAlert = null;
      }
      
      await api.assets.save(adjustedForm);
      setEditingAsset(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Handler
  const handleDeleteClick = async (assetId) => {
    if (window.confirm(`Are you sure you want to permanently delete asset ${assetId}?`)) {
      try {
        await api.assets.delete(assetId);
        loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // SVG QR tag downloading
  const downloadQR = (assetId) => {
    const svgElement = document.getElementById(`qr-svg-${assetId}`);
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const context = canvas.getContext('2d');
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, 300, 300);
      context.drawImage(image, 0, 0, 300, 300);
      
      const png = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = png;
      downloadLink.download = `MaintainIQ-QR-${assetId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    image.src = blobURL;
  };

  // Filtering calculations
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asset.assignedTechnician && asset.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus;
    
    const matchesLocation = selectedLocation === 'All' || asset.location.toLowerCase().startsWith(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  return (
    <div className="flex-1 flex flex-col space-y-6">
      
      {/* Header bar actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Assets Register</h2>
          <p className="text-xs text-slate-400 mt-1">Audit conditions, track assigned technicians, print labeling QR codes, and log services.</p>
        </div>
        <button
          onClick={() => setShowAddAsset(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/20 active:translate-y-0.5 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset</span>
        </button>
      </div>

      {/* Filter Toolbar Options */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col xl:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full xl:w-80 flex items-center">
          <input
            type="text"
            placeholder="Search code, name, technician, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800 focus:border-violet-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
        </div>

        {/* Dropdowns filters */}
        <div className="w-full xl:w-auto flex flex-wrap items-center justify-between sm:justify-start gap-3">
          
          {/* Category Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-550" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900/60 border border-slate-800 text-xs text-slate-350 rounded-lg p-2 focus:outline-none focus:border-violet-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 text-xs text-slate-350 rounded-lg p-2 focus:outline-none focus:border-violet-500"
          >
            <option value="All">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Degraded">Degraded</option>
            <option value="Critical">Critical</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          {/* Location Dropdown */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-900/60 border border-slate-800 text-xs text-slate-350 rounded-lg p-2 focus:outline-none focus:border-violet-500"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
            ))}
          </select>

          {/* View Mode Toggle Buttons */}
          <span className="hidden sm:inline w-px h-5 bg-slate-800/80 mx-1" />
          <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-850 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-violet-650/20 border border-violet-500/25 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Show grid cards view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-violet-650/20 border border-violet-500/25 text-violet-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Show table rows view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Grid or Table Listing View rendering */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-20 bg-slate-900/60 rounded-xl shimmer" />
          <div className="h-20 bg-slate-900/60 rounded-xl shimmer" />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-16 text-center text-slate-550 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <Filter className="w-12 h-12 text-slate-850 mx-auto mb-3" />
          No registered assets match your search parameters.
        </div>
      ) : viewMode === 'grid' ? (
        /* Render Grid View Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              className="glass-panel glass-panel-hover rounded-xl border border-slate-800 p-5 flex flex-col justify-between h-60 relative group"
            >
              <div>
                {/* Header code and category info */}
                <div className="flex items-start justify-between">
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-500 font-mono tracking-wider block">{asset.id}</span>
                    <h3 className="font-bold text-slate-200 text-sm mt-0.5 group-hover:text-white transition-colors truncate">
                      {asset.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold">{asset.category}</p>
                  </div>

                  <button
                    onClick={() => setActiveQRAsset(asset)}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-violet-400 border border-slate-850 transition-colors shrink-0"
                    title="View QR Label Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>

                {/* Body: Location, Condition, Tech */}
                <div className="mt-4 space-y-2.5 text-xs text-slate-450 border-t border-slate-900/60 pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span className="truncate">{asset.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <span className="truncate">{asset.assignedTechnician || 'Unassigned'}</span>
                    </div>
                    {/* Condition badge */}
                    <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getConditionColor(asset.condition)}`}>
                      {asset.condition || 'Good'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Status Badge & Action buttons */}
              <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 mt-4">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(asset.status)}`}>
                  {getStatusIcon(asset.status)}
                  <span>{asset.status}</span>
                </span>
                
                <div className="flex items-center gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/assets/${asset.id}`}
                    className="p-1.5 rounded hover:bg-slate-900 text-slate-400 hover:text-violet-400"
                    title="Explore specifications details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleEditClick(asset)}
                    className="p-1.5 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-400"
                    title="Edit asset details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(asset.id)}
                    className="p-1.5 rounded hover:bg-slate-900 text-slate-450 hover:text-rose-400"
                    title="Wipe asset node"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Render Table View Rows List */
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-900 text-slate-550 font-bold uppercase tracking-wider">
                  <th className="p-4">Asset Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {filteredAssets.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-900/15 transition-colors group">
                    <td className="p-4 font-mono font-bold text-slate-400">{asset.id}</td>
                    <td className="p-4">
                      <Link to={`/assets/${asset.id}`} className="font-bold text-slate-200 hover:text-violet-400 hover:underline block truncate max-w-[150px]">
                        {asset.name}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-450 font-semibold">{asset.category}</td>
                    <td className="p-4 text-slate-400 truncate max-w-[150px]">{asset.location.split(',')[0]}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getConditionColor(asset.condition)}`}>
                        {asset.condition || 'Good'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 border rounded-full text-[9px] font-bold ${getStatusClass(asset.status)}`}>
                        {getStatusIcon(asset.status)}
                        <span>{asset.status}</span>
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-400 flex items-center gap-1.5 pt-5">
                      <User className="w-3.5 h-3.5 text-slate-650" />
                      <span>{asset.assignedTechnician || 'Unassigned'}</span>
                    </td>
                    <td className="p-4 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => setActiveQRAsset(asset)}
                        className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-400 inline-block align-middle"
                        title="Generate QR Tag"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <Link
                        to={`/assets/${asset.id}`}
                        className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-400 inline-block align-middle"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleEditClick(asset)}
                        className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-violet-400 inline-block align-middle"
                        title="Edit Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(asset.id)}
                        className="p-1 rounded hover:bg-slate-900 text-slate-450 hover:text-rose-450 inline-block align-middle"
                        title="Delete Asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QR Code Detail Modal */}
      {activeQRAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-left">
              <div>
                <h3 className="font-bold text-white text-sm">Asset Tag QR Code</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Scannable platform identifier</p>
              </div>
              <button
                onClick={() => setActiveQRAsset(null)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <div className="my-6 flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-white rounded-lg inline-block border border-slate-200 shadow-md">
                <QRCodeSVG
                  id={`qr-svg-${activeQRAsset.id}`}
                  value={activeQRAsset.id}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <div>
                <span className="text-xs font-mono font-bold bg-slate-950 text-slate-300 px-3 py-1 rounded-md border border-slate-800">
                  {activeQRAsset.id}
                </span>
                <h4 className="text-sm font-semibold text-slate-200 mt-2.5">{activeQRAsset.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">Location: {activeQRAsset.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-800/80 pt-4">
              <Link
                to={`/scan-qr?qrId=${activeQRAsset.id}`}
                onClick={() => setActiveQRAsset(null)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
                <span>Simulate Scan</span>
              </Link>
              <button
                onClick={() => downloadQR(activeQRAsset.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md shadow-violet-600/10 transition-colors animate-pulse-slow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Tag</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset details Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Edit Asset Specifications</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans">Assigned Crew Tech</label>
                  <select
                    value={editForm.assignedTechnician}
                    onChange={(e) => setEditForm({ ...editForm, assignedTechnician: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Condition</label>
                  <select
                    value={editForm.condition}
                    onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Telemetry Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Critical">Critical</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Facility Location *</label>
                <input
                  type="text"
                  required
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Model Code</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Serial Code</label>
                  <input
                    type="text"
                    value={editForm.serialNumber}
                    onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/10 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-slide-up">
            <h3 className="text-base font-bold text-white mb-4">Register Asset Node</h3>
            
            <form onSubmit={handleAddAssetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Carrier HVAC Compressor"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Code (Optional - leave blank to auto-generate)</label>
                <input
                  type="text"
                  placeholder="e.g. QR-HVAC-MC-001"
                  value={newAsset.assetCode}
                  onChange={(e) => setNewAsset({ ...newAsset, assetCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="HVAC Systems">HVAC Systems</option>
                    <option value="IT Infrastructure">IT Infrastructure</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Utility Systems">Utility Systems</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans">Assigned Crew Tech</label>
                  <select
                    value={newAsset.assignedTechnician}
                    onChange={(e) => setNewAsset({ ...newAsset, assignedTechnician: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    {technicians.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Asset Condition</label>
                  <select
                    value={newAsset.condition}
                    onChange={(e) => setNewAsset({ ...newAsset, condition: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans">Criticality</label>
                  <select
                    value={newAsset.criticality}
                    onChange={(e) => setNewAsset({ ...newAsset, criticality: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Facility Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building A, Rooftop Section 4"
                  value={newAsset.location}
                  onChange={(e) => setNewAsset({ ...newAsset, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-300 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide font-sans">Model Code</label>
                  <input
                    type="text"
                    placeholder="e.g. WeatherMaker 50TC"
                    value={newAsset.model}
                    onChange={(e) => setNewAsset({ ...newAsset, model: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-305 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5 uppercase tracking-wide">Serial Code</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-98218"
                    value={newAsset.serialNumber}
                    onChange={(e) => setNewAsset({ ...newAsset, serialNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-305 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowAddAsset(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-600/10 transition-all"
                >
                  Register Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Assets;
