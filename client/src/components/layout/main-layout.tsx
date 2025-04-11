import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Convert path to title
  const getPageTitle = () => {
    const path = location.split("/")[1];
    
    if (!path) return "Dashboard";
    
    // Special case for nested routes
    if (location.includes("/register")) return "Daftar Pasien Baru";
    if (location.includes("/create")) {
      if (location.includes("/appointments")) return "Buat Janji Dokter";
      if (location.includes("/medical-records")) return "Buat Rekam Medis";
      if (location.includes("/pharmacy")) return "Order Farmasi";
      if (location.includes("/billing")) return "Buat Invoice";
    }
    
    // Map paths to titles
    const titles: { [key: string]: string } = {
      patients: "Pasien",
      appointments: "Janji Dokter",
      "medical-records": "Rekam Medis",
      pharmacy: "Farmasi",
      billing: "Billing",
      reports: "Laporan",
      "satu-sehat": "Satu Sehat",
      settings: "Pengaturan"
    };
    
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };
  
  return (
    <div className="flex h-screen bg-neutral-100">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          pageTitle={getPageTitle()} 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
