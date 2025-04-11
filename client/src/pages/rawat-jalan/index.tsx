import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, FilePlus } from "lucide-react";
import { RekamMedis, Pasien, User } from "@shared/schema";

export default function RawatJalanPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const { data: rekamMedis, isLoading: isLoadingRekamMedis } = useQuery<RekamMedis[]>({
    queryKey: ['/api/rekam-medis'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Get raw data for rawat jalan
  const rawatJalanData = rekamMedis?.filter(rm => rm.jenisPelayanan === "rawat jalan");

  // Filter based on tab and search
  const filteredRawatJalan = rawatJalanData?.filter(rm => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === rm.pasienId);
    const dokterData = users?.find(u => u.id === rm.dokterUserId);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      pasienData?.nama.toLowerCase().includes(searchLower) ||
      dokterData?.nama.toLowerCase().includes(searchLower) ||
      rm.diagnosis.toLowerCase().includes(searchLower);
    
    // Get today's date (for "hari-ini" tab)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const rmDate = new Date(rm.tanggal);
    rmDate.setHours(0, 0, 0, 0);
    
    // Filter by tab
    const matchesTab = 
      activeTab === "semua" || 
      (activeTab === "hari-ini" && rmDate.getTime() === today.getTime());
    
    return matchesSearch && matchesTab;
  });

  const isLoading = isLoadingRekamMedis || isLoadingPasien || isLoadingUsers;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Rawat Jalan" subtitle="Kelola layanan rawat jalan" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pasien Rawat Jalan</CardTitle>
                  <CardDescription>
                    Lihat dan kelola data pasien rawat jalan
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-medium" />
                    <Input
                      type="search"
                      placeholder="Cari pasien..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary-dark" asChild>
                    <Link href="/rekam-medis/buat?jenisPelayanan=rawat jalan">
                      <FilePlus className="mr-2 h-4 w-4" />
                      Pasien Baru
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="semua" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="hari-ini">Hari Ini</TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRawatJalan && filteredRawatJalan.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Pasien</TableHead>
                          <TableHead>No. RM</TableHead>
                          <TableHead>Dokter</TableHead>
                          <TableHead>Diagnosis</TableHead>
                          <TableHead>Tindakan</TableHead>
                          <TableHead>Status Sinkron</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRawatJalan.map((rm) => {
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
                              <TableCell>{pasienData?.nomorRM || "-"}</TableCell>
                              <TableCell>{dokterData?.nama || "-"}</TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {rm.diagnosis}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {rm.tindakan || "-"}
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
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8"
                                    asChild
                                  >
                                    <Link href={`/rekam-medis/${rm.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 bg-primary hover:bg-primary-dark"
                                    asChild
                                  >
                                    <Link href={`/resep/buat?rekamMedisId=${rm.id}`}>
                                      Resep
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-dark">
                    {searchQuery ? (
                      <p>Tidak ada hasil yang cocok dengan pencarian "{searchQuery}"</p>
                    ) : activeTab === "hari-ini" ? (
                      <p>Belum ada pasien rawat jalan hari ini.</p>
                    ) : (
                      <p>Belum ada data rawat jalan. Silahkan tambahkan pasien baru.</p>
                    )}
                  </div>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
