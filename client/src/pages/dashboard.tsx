import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, FileText, UserPlus, BarChart } from "lucide-react";
import { STATS_DATA } from "@/lib/constants";
import AppointmentTable from "@/components/dashboard/appointment-table";
import SatuSehatStatus from "@/components/dashboard/satu-sehat-status";

const Dashboard: React.FC = () => {
  return (
    <div id="dashboard-section" className="space-y-6">
      {/* Status Integrasi Section */}
      <div className="flex items-center justify-between bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center">
          <span className="material-icons text-neutral-600 mr-2">sync</span>
          <div>
            <p className="text-sm text-neutral-600">Status Integrasi Satu Sehat</p>
            <p className="text-sm font-medium text-neutral-800">Terhubung</p>
          </div>
        </div>
        <Link href="/settings">
          <a className="text-sm text-blue-600 hover:text-blue-800">Konfigurasi</a>
        </Link>
      </div>
      
      {/* Akses Cepat */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAccessCard 
            icon={<UserPlus className="h-6 w-6 text-blue-600" />} 
            title="Pendaftaran Pasien Baru"
            href="/patients/register"
          />
          <QuickAccessCard 
            icon={<Calendar className="h-6 w-6 text-blue-600" />} 
            title="Jadwalkan Kunjungan"
            href="/appointments/create"
          />
          <QuickAccessCard 
            icon={<FileText className="h-6 w-6 text-blue-600" />} 
            title="Rekam Medis"
            href="/medical-records"
          />
          <QuickAccessCard 
            icon={<BarChart className="h-6 w-6 text-blue-600" />} 
            title="Laporan"
            href="/reports"
          />
        </div>
      </div>
      
      {/* Informasi Harian Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Informasi Harian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS_DATA.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              title={stat.value}
              subtitle={stat.label}
              change={index % 2 === 0 ? "+8%" : "-3%"}
            />
          ))}
        </div>
      </div>
      
      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Jadwal Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentTable />
              <div className="mt-4 text-center">
                <Link href="/appointments">
                  <a className="text-sm text-blue-600 hover:text-blue-800">Lihat Semua</a>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Status Integrasi Satu Sehat</CardTitle>
            </CardHeader>
            <CardContent>
              <SatuSehatStatus />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  icon: string;
  title: string;
  subtitle: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, subtitle, change }) => {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="material-icons text-neutral-600">{icon}</span>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-sm text-neutral-600">{subtitle}</p>
      <p className="text-xs text-neutral-500 mt-2">Dibandingkan hari kemarin</p>
    </div>
  );
};

interface QuickAccessCardProps {
  icon: React.ReactNode;
  title: string;
  href: string;
}

const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ icon, title, href }) => {
  return (
    <Link href={href}>
      <a className="bg-white p-6 rounded-md shadow-sm flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
        <div className="mb-3">{icon}</div>
        <p className="text-sm font-medium text-neutral-800">{title}</p>
      </a>
    </Link>
  );
};

export default Dashboard;
