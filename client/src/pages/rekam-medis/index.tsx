import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, FileText, Plus } from "lucide-react";
import { RekamMedis, Pasien, User } from "@shared/schema";

export default function RekamMedisPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPasien, setSelectedPasien] = useState<string>("");

  // Get query parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const pasienIdParam = params.get("pasienId");

  const { data: rekamMedis, isLoading: isLoadingRekamMedis } = useQuery<RekamMedis[]>({
    queryKey: ['/api/rekam-medis'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Set selected pasien from URL parameter
  useState(() => {
    if (pasienIdParam) {
      setSelectedPasien(pasienIdParam);
    }
  });

  const filteredRekamMedis = rekamMedis?.filter(rm => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === rm.pasienId);
    const dokterData = users?.find(u => u.id === rm.dokterUserId);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      pasienData?.nama.toLowerCase().includes(searchLower) ||
      dokterData?.nama.toLowerCase().includes(searchLower) ||
      rm.diagnosis.toLowerCase().includes(searchLower);
    
    // Filter by selected pasien
    const matchesPasien = !selectedPasien || rm.pasienId.toString() === selectedPasien;
    
    return matchesSearch && matchesPasien;
  });

  const isLoading = isLoadingRekamMedis || isLoadingPasien || isLoadingUsers;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Rekam Medis" subtitle="Kelola rekam medis elektronik pasien" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Rekam Medis</CardTitle>
                  <CardDescription>
                    Lihat dan kelola rekam medis pasien
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-medium" />
                    <Input
                      type="search"
                      placeholder="Cari rekam medis..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary-dark" asChild>
                    <Link href="/rekam-medis/buat">
                      <Plus className="mr-2 h-4 w-4" />
                      Rekam Medis Baru
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="w-full sm:w-[300px]">
                    <Select
                      value={selectedPasien}
                      onValueChange={setSelectedPasien}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Filter berdasarkan pasien" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Pasien</SelectItem>
                        {isLoadingPasien ? (
                          <div className="flex justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          pasien?.map((p) => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.nama} - {p.nomorRM}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedPasien && (
                    <Button
                      variant="outline"
                      onClick={() => setSelectedPasien("")}
                      className="sm:w-auto w-full"
                    >
                      Reset Filter
                    </Button>
                  )}
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredRekamMedis && filteredRekamMedis.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Pasien</TableHead>
                        <TableHead>Dokter</TableHead>
                        <TableHead>Keluhan Utama</TableHead>
                        <TableHead>Diagnosis</TableHead>
                        <TableHead>Jenis Pelayanan</TableHead>
                        <TableHead>Status Sinkron</TableHead>
                        <TableHead className="text-right">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRekamMedis.map((rm) => {
                        const pasienData = pasien?.find(p => p.id === rm.pasienId);
                        const dokterData = users?.find(u => u.id === rm.dokterUserId);
                        
                        return (
                          <TableRow key={rm.id}>
                            <TableCell>
                              {new Date(rm.tanggal).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{pasienData?.nama || "-"}</TableCell>
                            <TableCell>{dokterData?.nama || "-"}</TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {rm.keluhanUtama}
                            </TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {rm.diagnosis}
                            </TableCell>
                            <TableCell>
                              {rm.jenisPelayanan === "rawat jalan" ? "Rawat Jalan" : "Rawat Inap"}
                            </TableCell>
                            <TableCell>
                              {rm.statusSinkronisasi === "selesai" ? (
                                <Badge className="bg-status-success">Sinkronisasi</Badge>
                              ) : rm.statusSinkronisasi === "proses" ? (
                                <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">Proses</Badge>
                              ) : (
                                <Badge variant="outline" className="bg-neutral-light/50 text-neutral-dark border-neutral-dark">Belum</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                asChild
                              >
                                <Link href={`/rekam-medis/${rm.id}`}>
                                  <FileText className="mr-1 h-4 w-4 text-neutral-dark" />
                                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Detail
                                  </span>
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-dark">
                  {searchQuery || selectedPasien ? (
                    <p>Tidak ada rekam medis yang sesuai dengan filter yang diterapkan</p>
                  ) : (
                    <p>Belum ada data rekam medis. Silahkan buat rekam medis baru.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
