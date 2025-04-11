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
import { Loader2, Search, FilePlus, FlaskRound } from "lucide-react";
import { Laboratorium, Pasien, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LaboratoriumPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const { data: laboratorium, isLoading: isLoadingLab } = useQuery<Laboratorium[]>({
    queryKey: ['/api/laboratorium'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Update lab status
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/laboratorium/${id}`, { status });
      
      toast({
        title: "Status Diperbarui",
        description: `Status pemeriksaan berhasil diubah menjadi ${status}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/laboratorium'] });
    } catch (error) {
      toast({
        title: "Gagal Memperbarui Status",
        description: "Terjadi kesalahan saat memperbarui status pemeriksaan",
        variant: "destructive",
      });
    }
  };

  // Filter based on tab and search
  const filteredLab = laboratorium?.filter(lab => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === lab.pasienId);
    const dokterData = users?.find(u => u.id === lab.dokterUserId);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (pasienData?.nama.toLowerCase().includes(searchLower)) ||
      (pasienData?.nomorRM.toLowerCase().includes(searchLower)) ||
      lab.jenisPemeriksaan.toLowerCase().includes(searchLower);
    
    // Filter by tab
    const matchesTab = activeTab === "semua" || 
      (activeTab === "menunggu" && lab.status === "menunggu") ||
      (activeTab === "diproses" && lab.status === "diproses") ||
      (activeTab === "selesai" && lab.status === "selesai");
    
    return matchesSearch && matchesTab;
  });

  const isLoading = isLoadingLab || isLoadingPasien || isLoadingUsers;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Laboratorium" subtitle="Kelola pemeriksaan laboratorium" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pemeriksaan Laboratorium</CardTitle>
                  <CardDescription>
                    Kelola permintaan dan hasil pemeriksaan lab
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
                    <Link href="/laboratorium/tambah">
                      <FlaskRound className="mr-2 h-4 w-4" />
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
                ) : filteredLab && filteredLab.length > 0 ? (
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
                        {filteredLab.map((lab) => {
                          const pasienData = pasien?.find(p => p.id === lab.pasienId);
                          const dokterData = users?.find(u => u.id === lab.dokterUserId);
                          
                          return (
                            <TableRow key={lab.id}>
                              <TableCell>
                                {new Date(lab.tanggal).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>{pasienData?.nama || "-"}</TableCell>
                              <TableCell>{pasienData?.nomorRM || "-"}</TableCell>
                              <TableCell>{dokterData?.nama || "-"}</TableCell>
                              <TableCell>{lab.jenisPemeriksaan}</TableCell>
                              <TableCell>
                                {lab.status === "selesai" ? (
                                  <Badge className="bg-status-success">Selesai</Badge>
                                ) : lab.status === "diproses" ? (
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
                                    <Link href={`/laboratorium/${lab.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                  {lab.status === "menunggu" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-primary hover:bg-primary-dark"
                                      onClick={() => handleUpdateStatus(lab.id, "diproses")}
                                    >
                                      Proses
                                    </Button>
                                  )}
                                  {lab.status === "diproses" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-status-success hover:bg-status-success/90"
                                      asChild
                                    >
                                      <Link href={`/laboratorium/${lab.id}/hasil`}>
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
                      <p>Belum ada data pemeriksaan laboratorium. Silahkan tambahkan pemeriksaan baru.</p>
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
