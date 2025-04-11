
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location, isMobile]);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const getPageTitle = () => {
    const path = location.split("/")[1];
    if (!path) return "Dashboard";
    if (location.includes("/register")) return "Pendaftaran Pasien Baru";
    if (location.includes("/create")) {
      if (location.includes("/appointments")) return "Buat Janji Dokter";
      if (location.includes("/medical-records")) return "Buat Rekam Medis";
      if (location.includes("/pharmacy")) return "Order Farmasi";
      if (location.includes("/billing")) return "Buat Invoice";
    }

    const titles: { [key: string]: string } = {
      patients: "Pasien",
      appointments: "Janji Dokter",
      "medical-records": "Rekam Medis",
      pharmacy: "Farmasi",
      billing: "Billing",
      reports: "Laporan",
      "satu-sehat": "Satu Sehat",
      settings: "Pengaturan",
      bantuan: "Bantuan"
    };

    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div 
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <Sidebar />
      </div>
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          pageTitle={getPageTitle()} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
