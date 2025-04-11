import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PatientsHistory: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  
  // Sample query - replace with actual API query
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Function to handle period change
  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    // Here you would refetch data with new period filter
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Riwayat Kunjungan Pasien</h1>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari ini</SelectItem>
              <SelectItem value="week">Minggu ini</SelectItem>
              <SelectItem value="month">Bulan ini</SelectItem>
              <SelectItem value="all">Semua waktu</SelectItem>
            </SelectContent>
          </Select>
          
          <Link href="/appointments/create">
            <Button className="bg-[#0a192f] hover:bg-[#172a46]">
              <Calendar className="h-4 w-4 mr-2" />
              Tambah Kunjungan
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search & Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Filter Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input 
                placeholder="Cari berdasarkan nama pasien atau no. rekam medis..." 
                className="pl-10 w-full" 
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Status kunjungan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua status</SelectItem>
                <SelectItem value="completed">Selesai</SelectItem>
                <SelectItem value="in_progress">Sedang berjalan</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Lanjutan
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Visit History Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jam</TableHead>
                  <TableHead>No. RM</TableHead>
                  <TableHead>Nama Pasien</TableHead>
                  <TableHead>Dokter</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Memuat riwayat kunjungan...</p>
                    </TableCell>
                  </TableRow>
                ) : appointments && appointments.length > 0 ? (
                  appointments.map((appointment: any, index: number) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>{appointment.patient?.medicalRecordNumber}</TableCell>
                      <TableCell className="font-medium">{appointment.patient?.name}</TableCell>
                      <TableCell>{appointment.doctor}</TableCell>
                      <TableCell>{appointment.complaint}</TableCell>
                      <TableCell>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium inline-block
                          ${appointment.status === "Hadir" ? "bg-green-100 text-green-800" : 
                            appointment.status === "Menunggu" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-gray-100 text-gray-800"}`}>
                          {appointment.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/medical-records?appointmentId=${appointment.id}`}>
                            <Button size="sm" variant="ghost">
                              <span className="material-icons text-sm">description</span>
                              <span className="sr-only">Detail</span>
                            </Button>
                          </Link>
                          <Link href={`/appointments/${appointment.id}`}>
                            <Button size="sm" variant="ghost">
                              <span className="material-icons text-sm">edit</span>
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                      Tidak ada riwayat kunjungan yang ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientsHistory;