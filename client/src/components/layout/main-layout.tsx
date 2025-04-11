import React, { useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useLocation } from "wouter";
import { useIsMobile } from "@/hooks/use-mobile";

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  const [location] = useLocation();

  // Convert path to title (retained from original code)
  const getPageTitle = () => {
    const path = location.split("/")[1];

    if (!path) return "Dashboard";

    // Special case for nested routes (retained from original code)
    if (location.includes("/register")) return "Pendaftaran Pasien Baru";
    if (location.includes("/create")) {
      if (location.includes("/appointments")) return "Buat Janji Dokter";
      if (location.includes("/medical-records")) return "Buat Rekam Medis";
      if (location.includes("/pharmacy")) return "Order Farmasi";
      if (location.includes("/billing")) return "Buat Invoice";
    }

    // Map paths to titles (retained from original code)
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header pageTitle={getPageTitle()} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-screen-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;