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
import { Loader2, Search, Plus, Stethoscope } from "lucide-react";
import { Radiologi, Pasien, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function RadiologiPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const { data: radiologi, isLoading: isLoadingRadiologi } = useQuery<Radiologi[]>({
    queryKey: ['/api/radiologi'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Update radiologi status
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/radiologi/${id}`, { status });
      
      toast({
        title: "Status Diperbarui",
        description: `Status pemeriksaan berhasil diubah menjadi ${status}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/radiologi'] });
    } catch (error) {
      toast({
        title: "Gagal Memperbarui Status",
        description: "Terjadi kesalahan saat memperbarui status pemeriksaan",
        variant: "destructive",
      });
    }
  };

  // Filter based on tab and search
  const filteredRadiologi = radiologi?.filter(rad => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === rad.pasienId);
    const dokterData = users?.find(u => u.id === rad.dokterUserId);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (pasienData?.nama.toLowerCase().includes(searchLower)) ||
      (pasienData?.nomorRM?.toLowerCase().includes(searchLower)) ||
      rad.jenisPemeriksaan.toLowerCase().includes(searchLower);
    
    // Filter by tab
    const matchesTab = activeTab === "semua" || 
      (activeTab === "menunggu" && rad.status === "menunggu") ||
      (activeTab === "diproses" && rad.status === "diproses") ||
      (activeTab === "selesai" && rad.status === "selesai");
    
    return matchesSearch && matchesTab;
  });

  const isLoading = isLoadingRadiologi || isLoadingPasien || isLoadingUsers;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Radiologi" subtitle="Kelola pemeriksaan radiologi" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pemeriksaan Radiologi</CardTitle>
                  <CardDescription>
                    Kelola permintaan dan hasil pemeriksaan radiologi
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-medium" />
                    <Input
                      type="search"
                      placeholder="Cari pemeriksaan..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary-dark" asChild>
                    <Link href="/radiologi/tambah">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Pemeriksaan Baru
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="semua" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="menunggu">Menunggu</TabsTrigger>
                  <TabsTrigger value="diproses">Diproses</TabsTrigger>
                  <TabsTrigger value="selesai">Selesai</TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRadiologi && filteredRadiologi.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Pasien</TableHead>
                          <TableHead>No. RM</TableHead>
                          <TableHead>Dokter</TableHead>
                          <TableHead>Jenis Pemeriksaan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRadiologi.map((rad) => {
                          const pasienData = pasien?.find(p => p.id === rad.pasienId);
                          const dokterData = users?.find(u => u.id === rad.dokterUserId);
                          
                          return (
                            <TableRow key={rad.id}>
                              <TableCell>
                                {new Date(rad.tanggal).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>{pasienData?.nama || "-"}</TableCell>
                              <TableCell>{pasienData?.nomorRM || "-"}</TableCell>
                              <TableCell>{dokterData?.nama || "-"}</TableCell>
                              <TableCell>{rad.jenisPemeriksaan}</TableCell>
                              <TableCell>
                                {rad.status === "selesai" ? (
                                  <Badge className="bg-status-success">Selesai</Badge>
                                ) : rad.status === "diproses" ? (
                                  <Badge className="bg-status-info">Diproses</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">Menunggu</Badge>
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
                                    <Link href={`/radiologi/${rad.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                  {rad.status === "menunggu" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-primary hover:bg-primary-dark"
                                      onClick={() => handleUpdateStatus(rad.id, "diproses")}
                                    >
                                      Proses
                                    </Button>
                                  )}
                                  {rad.status === "diproses" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-status-success hover:bg-status-success/90"
                                      asChild
                                    >
                                      <Link href={`/radiologi/${rad.id}/hasil`}>
                                        Input Hasil
                                      </Link>
                                    </Button>
                                  )}
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
                    ) : activeTab !== "semua" ? (
                      <p>Tidak ada pemeriksaan dengan status {activeTab}.</p>
                    ) : (
                      <p>Belum ada data pemeriksaan radiologi. Silahkan tambahkan pemeriksaan baru.</p>
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
