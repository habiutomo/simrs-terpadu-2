import { useState } from "react";
import { Jadwal, Pasien, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

interface TodayScheduleProps {
  jadwal?: Jadwal[];
}

export default function TodaySchedule({ jadwal }: TodayScheduleProps) {
  const [activeTab, setActiveTab] = useState("semua");
  
  const { data: pasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });
  
  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });
  
  // Filter jadwal based on active tab
  const filteredJadwal = jadwal?.filter(j => {
    if (activeTab === "semua") return true;
    if (activeTab === "poli") return j.jenisPelayanan === "poli";
    if (activeTab === "laboratoriun") return j.jenisPelayanan === "laboratorium";
    if (activeTab === "radiologi") return j.jenisPelayanan === "radiologi";
    return true;
  });

  const getStatusClass = (status: string) => {
    switch (status) {
      case "konfirmasi":
        return "bg-status-success/10 text-status-success";
      case "menunggu":
        return "bg-status-warning/10 text-status-warning";
      case "batal":
        return "bg-status-error/10 text-status-error";
      default:
        return "bg-neutral-light/50 text-neutral-dark";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Tab content when no data is available
  const emptyTabContent = (
    <div className="flex items-center justify-center p-8 text-neutral-medium">
      <div className="text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-neutral-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Pilih tab lain untuk melihat jadwal berdasarkan kategori</p>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-light flex justify-between items-center">
        <CardTitle className="font-nunito font-bold text-neutral-darkest">Jadwal Hari Ini</CardTitle>
        <Link href="/jadwal">
          <a className="text-primary hover:text-primary-dark text-sm font-medium">Lihat Semua</a>
        </Link>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Tabs */}
        <div className="flex border-b border-neutral-light mb-4">
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === "semua" 
              ? "text-primary border-b-2 border-primary" 
              : "text-neutral-medium hover:text-neutral-dark"}`}
            onClick={() => setActiveTab("semua")}
          >
            Semua
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === "poli" 
              ? "text-primary border-b-2 border-primary" 
              : "text-neutral-medium hover:text-neutral-dark"}`}
            onClick={() => setActiveTab("poli")}
          >
            Poli
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === "laboratoriun" 
              ? "text-primary border-b-2 border-primary" 
              : "text-neutral-medium hover:text-neutral-dark"}`}
            onClick={() => setActiveTab("laboratoriun")}
          >
            Laboratorium
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm ${activeTab === "radiologi" 
              ? "text-primary border-b-2 border-primary" 
              : "text-neutral-medium hover:text-neutral-dark"}`}
            onClick={() => setActiveTab("radiologi")}
          >
            Radiologi
          </button>
        </div>
        
        {/* Tab content */}
        <div className={activeTab === "semua" ? "block" : "hidden"}>
          {filteredJadwal && filteredJadwal.length > 0 ? (
            <div className="divide-y divide-neutral-light">
              {filteredJadwal.map((j) => {
                const pasienData = pasien?.find(p => p.id === j.pasienId);
                const jadwalTime = new Date(j.tanggal);
                const formattedTime = jadwalTime.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit"
                });
                
                return (
                  <div key={j.id} className="py-3 flex items-center justify-between">
                    <div className="flex">
                      <div className="mr-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          {pasienData ? getInitials(pasienData.nama) : "--"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-neutral-darkest">{pasienData?.nama || "Pasien"}</div>
                        <div className="text-sm text-neutral-medium">
                          {j.jenisPelayanan === "poli" ? "Poli" : j.jenisPelayanan} {j.namaLayanan} • {formattedTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      <div className={`px-2 py-1 rounded-full ${getStatusClass(j.status)} text-xs mr-2`}>
                        {j.status.charAt(0).toUpperCase() + j.status.slice(1)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4 text-neutral-dark hover:text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/jadwal/${j.id}`}>Lihat Detail</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/jadwal/${j.id}/edit`}>Edit Jadwal</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-neutral-medium">
              Tidak ada jadwal untuk hari ini
            </div>
          )}
        </div>
        
        <div className={activeTab === "poli" ? "block" : "hidden"}>
          {filteredJadwal && filteredJadwal.length > 0 ? (
            <div className="divide-y divide-neutral-light">
              {/* Content would be similar to the "semua" tab but filtered */}
              {/* For now showing empty state */}
            </div>
          ) : emptyTabContent}
        </div>
        
        <div className={activeTab === "laboratoriun" ? "block" : "hidden"}>
          {filteredJadwal && filteredJadwal.length > 0 ? (
            <div className="divide-y divide-neutral-light">
              {/* Content would be similar to the "semua" tab but filtered */}
            </div>
          ) : emptyTabContent}
        </div>
        
        <div className={activeTab === "radiologi" ? "block" : "hidden"}>
          {filteredJadwal && filteredJadwal.length > 0 ? (
            <div className="divide-y divide-neutral-light">
              {/* Content would be similar to the "semua" tab but filtered */}
            </div>
          ) : emptyTabContent}
        </div>
      </CardContent>
    </Card>
  );
}
