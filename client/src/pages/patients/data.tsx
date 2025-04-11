import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PatientsData: React.FC = () => {
  const { data: patients, isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Data Pasien</h1>
        
        <Link href="/patients/register">
          <Button className="bg-[#0a192f] hover:bg-[#172a46]">
            <UserPlus className="h-4 w-4 mr-2" />
            Daftar Pasien Baru
          </Button>
        </Link>
      </div>
      
      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <div className="flex gap-4 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Cari pasien berdasarkan nama, NIK, atau nomor rekam medis..." 
              className="pl-10 w-full" 
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>
      </div>
      
      {/* Patient List Table */}
      <div className="bg-white rounded-md shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">No.</TableHead>
                <TableHead>No. RM</TableHead>
                <TableHead>Nama Pasien</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>No. Telepon</TableHead>
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
                    <p className="mt-2 text-sm text-gray-500">Memuat data pasien...</p>
                  </TableCell>
                </TableRow>
              ) : patients && patients.length > 0 ? (
                patients.map((patient: any, index: number) => (
                  <TableRow key={patient.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{patient.medicalRecordNumber}</TableCell>
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.nationalId}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.dateOfBirth}</TableCell>
                    <TableCell>{patient.address}</TableCell>
                    <TableCell>{patient.phoneNumber}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/patients/${patient.id}`}>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Detail</span>
                          </Button>
                        </Link>
                        <Link href={`/medical-records?patientId=${patient.id}`}>
                          <Button size="sm" variant="ghost">
                            <span className="material-icons text-sm">folder</span>
                            <span className="sr-only">Rekam Medis</span>
                          </Button>
                        </Link>
                        <Link href={`/appointments/create?patientId=${patient.id}`}>
                          <Button size="sm" variant="ghost">
                            <span className="material-icons text-sm">event</span>
                            <span className="sr-only">Buat Janji</span>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                    Tidak ada data pasien yang ditemukan
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default PatientsData;