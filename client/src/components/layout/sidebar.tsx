
import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, Users, Calendar, FileText, 
  Stethoscope, Hotel, Pill, TestTube, 
  Radio, BarChart2, Settings, HelpCircle, 
  LogOut, ChevronDown
} from "lucide-react";

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location.startsWith(path);
  };

  return (
    <aside className="flex h-full flex-col bg-[#0A1A2C] text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#0A1A2C] font-bold">
            RS
          </div>
          <span className="font-semibold">SIMRS Terpadu</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-lg p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-sm">Administrator</span>
              <span className="text-xs text-white/60">RSUD Harapan Bunda</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Home size={20} /> Dashboard
          </Link>
          
          <Link href="/patients" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/patients") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Users size={20} /> Pasien
          </Link>
          
          <Link href="/appointments" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/appointments") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Calendar size={20} /> Jadwal & Appointment
          </Link>
          
          <Link href="/medical-records" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/medical-records") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <FileText size={20} /> Rekam Medis
          </Link>
          
          <Link href="/outpatient" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/outpatient") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Stethoscope size={20} /> Rawat Jalan
          </Link>
          
          <Link href="/inpatient" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/inpatient") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Hotel size={20} /> Rawat Inap
          </Link>
          
          <Link href="/pharmacy" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/pharmacy") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Pill size={20} /> Farmasi
          </Link>
          
          <Link href="/laboratory" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/laboratory") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <TestTube size={20} /> Laboratorium
          </Link>
          
          <Link href="/radiology" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/radiology") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Radio size={20} /> Radiologi
          </Link>
          
          <Link href="/reports" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/reports") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <BarChart2 size={20} /> Laporan
          </Link>
          
          <Link href="/settings" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/settings") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <Settings size={20} /> Pengaturan
          </Link>
        </nav>

        <div className="mt-auto space-y-1">
          <Link href="/help" className={`flex items-center gap-2 rounded-lg p-2 transition-colors ${isActive("/help") ? "bg-white/20" : "hover:bg-white/10"}`}>
            <HelpCircle size={20} /> Bantuan
          </Link>
          <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors hover:bg-white/10">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
