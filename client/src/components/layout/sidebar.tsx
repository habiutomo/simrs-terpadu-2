import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Home,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  Hotel,
  Pills,
  TestTubes,
  Radio,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown
} from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-[#0A1A2C] text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-[#0A1A2C] font-bold">
            RS
          </div>
          <span className="font-semibold">SIMRS Terpadu</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
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

        <nav className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Home size={20} /> Dashboard
          </Link>
          <div>
            <button className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-white/10">
              <Users size={20} /> 
              <span className="flex-1 text-left">Pasien</span>
              <ChevronDown size={16} />
            </button>
          </div>
          <Link href="/appointments" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Calendar size={20} /> Jadwal & Appointment
          </Link>
          <Link href="/medical-records" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <FileText size={20} /> Rekam Medis
          </Link>
          <Link href="/outpatient" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Stethoscope size={20} /> Rawat Jalan
          </Link>
          <Link href="/inpatient" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Hotel size={20} /> Rawat Inap
          </Link>
          <Link href="/pharmacy" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Pills size={20} /> Farmasi
          </Link>
          <Link href="/laboratory" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <TestTubes size={20} /> Laboratorium
          </Link>
          <Link href="/radiology" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Radio size={20} /> Radiologi
          </Link>
          <Link href="/reports" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <BarChart2 size={20} /> Laporan
          </Link>
          <Link href="/settings" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <Settings size={20} /> Pengaturan
          </Link>
        </nav>

        <div className="mt-auto space-y-1">
          <Link href="/help" className="flex items-center gap-2 rounded-lg p-2 hover:bg-white/10">
            <HelpCircle size={20} /> Bantuan
          </Link>
          <button className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-white/10">
            <LogOut size={20} /> Keluar
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;