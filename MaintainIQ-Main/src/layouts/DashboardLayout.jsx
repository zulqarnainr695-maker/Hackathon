import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Background Neon Glow Orbs */}
      <div className="bg-glow-purple top-10 left-[10%]" />
      <div className="bg-glow-emerald bottom-20 right-[5%]" />

      {/* Collapsible Sidebar Overlay */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobileOpen={mobileDrawerOpen}
        closeMobileSidebar={() => setMobileDrawerOpen(false)}
      />

      {/* Main Page Content Shell */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full
          ${sidebarOpen ? 'md:pl-64' : 'md:pl-20'}
          pl-0
        `}
      >
        {/* Top Navbar */}
        <Navbar toggleMobileSidebar={toggleMobileSidebar} />

        {/* Dynamic Outlet Page Content */}
        <main className="flex-1 flex flex-col p-6 relative z-10 overflow-x-hidden">
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
