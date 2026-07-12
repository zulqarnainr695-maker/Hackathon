import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import WorkOrders from './pages/WorkOrders';
import MaintenanceLogs from './pages/MaintenanceLogs';
import AIInsights from './pages/AIInsights';
import ScanQR from './pages/ScanQR';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';

// New Pages
import Issues from './pages/Issues';
import Technicians from './pages/Technicians';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import PublicAsset from './pages/PublicAsset';
import ReportIssue from './pages/ReportIssue';
import AITriage from './pages/AITriage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import LogMaintenance from './pages/LogMaintenance';
import NotFound from './pages/NotFound';

// Global Context
import { ToastProvider } from './context/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public QR Landing Bypasses (No Auth Required) */}
          <Route path="/public/assets/:id" element={<PublicAsset />} />
          <Route path="/report-issue/:assetId" element={<ReportIssue />} />

          {/* Protected Dashboard Shell Routes */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/history" element={<MaintenanceLogs />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/scan-qr" element={<ScanQR />} />
            <Route path="/settings" element={<Settings />} />
            
            {/* New Extended Modules */}
            <Route path="/ai-triage" element={<AITriage />} />
            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            <Route path="/maintenance/:woId" element={<LogMaintenance />} />
          </Route>

          {/* 404 Fallback routing */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
