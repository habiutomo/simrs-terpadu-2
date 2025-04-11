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
import { Loader2, Search, Plus, Package, Pill } from "lucide-react";
import { Resep, Pasien, RekamMedis, User, Obat } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function FarmasiPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("resep");

  const { data: resep, isLoading: isLoadingResep } = useQuery<Resep[]>({
    queryKey: ['/api/resep'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: rekamMedis, isLoading: isLoadingRekamMedis } = useQuery<RekamMedis[]>({
    queryKey: ['/api/rekam-medis'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: obat, isLoading: isLoadingObat } = useQuery<Obat[]>({
    queryKey: ['/api/obat'],
  });

  // Update resep status
  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiRequest("PUT", `/api/resep/${id}`, { status });
      
      toast({
        title: "Status Diperbarui",
        description: `Status resep berhasil diubah menjadi ${status}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/resep'] });
    } catch (error) {
      toast({
        title: "Gagal Memperbarui Status",
        description: "Terjadi kesalahan saat memperbarui status resep",
        variant: "destructive",
      });
    }
  };

  // Filter based on tab and search
  const filteredResep = resep?.filter(r => {
    // Get rekamMedis and pasien data
    const rmData = rekamMedis?.find(rm => rm.id === r.rekamMedisId);
    const pasienData = rmData ? pasien?.find(p => p.id === rmData.pasienId) : undefined;
    
    // Filter by search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      (pasienData?.nama.toLowerCase().includes(searchLower)) ||
      (pasienData?.nomorRM.toLowerCase().includes(searchLower));
    
    return matchesSearch;
  });

  // Filter obat based on search
  const filteredObat = obat?.filter(o => {
    const searchLower = searchQuery.toLowerCase();
    return !searchQuery ||
      o.nama.toLowerCase().includes(searchLower) ||
      o.kode.toLowerCase().includes(searchLower) ||
      o.kategori.toLowerCase().includes(searchLower);
  });

  const isLoading = isLoadingResep || isLoadingPasien || isLoadingRekamMedis || isLoadingUsers || isLoadingObat;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Farmasi" subtitle="Kelola resep dan inventaris obat" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Manajemen Farmasi</CardTitle>
                  <CardDescription>
                    Kelola resep dan inventaris obat
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-medium" />
                    <Input
                      type="search"
                      placeholder="Cari..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary-dark" asChild>
                    <Link href={activeTab === "resep" ? "/farmasi/resep/buat" : "/farmasi/obat/tambah"}>
                      <Plus className="mr-2 h-4 w-4" />
                      {activeTab === "resep" ? "Resep Baru" : "Tambah Obat"}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resep" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="resep">Resep</TabsTrigger>
                  <TabsTrigger value="inventaris">Inventaris Obat</TabsTrigger>
                </TabsList>
                
                <TabsContent value="resep">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredResep && filteredResep.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>No. Resep</TableHead>
                            <TableHead>Pasien</TableHead>
                            <TableHead>No. RM</TableHead>
                            <TableHead>Dokter</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResep.map((r) => {
                            const rmData = rekamMedis?.find(rm => rm.id === r.rekamMedisId);
                            const pasienData = rmData ? pasien?.find(p => p.id === rmData.pasienId) : undefined;
                            const dokterData = rmData ? users?.find(u => u.id === rmData.dokterUserId) : undefined;
                            
                            return (
                              <TableRow key={r.id}>
                                <TableCell>
                                  {new Date(r.tanggal).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </TableCell>
                                <TableCell className="font-medium">R-{r.id.toString().padStart(4, '0')}</TableCell>
                                <TableCell>{pasienData?.nama || "-"}</TableCell>
                                <TableCell>{pasienData?.nomorRM || "-"}</TableCell>
                                <TableCell>{dokterData?.nama || "-"}</TableCell>
                                <TableCell>
                                  {r.status === "selesai" ? (
                                    <Badge className="bg-status-success">Selesai</Badge>
                                  ) : r.status === "diproses" ? (
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
                                      <Link href={`/farmasi/resep/${r.id}`}>
                                        Detail
                                      </Link>
                                    </Button>
                                    {r.status === "menunggu" && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 bg-primary hover:bg-primary-dark"
                                        onClick={() => handleUpdateStatus(r.id, "diproses")}
                                      >
                                        Proses
                                      </Button>
                                    )}
                                    {r.status === "diproses" && (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8 bg-status-success hover:bg-status-success/90"
                                        onClick={() => handleUpdateStatus(r.id, "selesai")}
                                      >
                                        Selesai
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
                      ) : (
                        <p>Belum ada data resep. Silahkan buat resep baru.</p>
                      )}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="inventaris">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredObat && filteredObat.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Nama Obat</TableHead>
                            <TableHead>Kategori</TableHead>
                            <TableHead>Satuan</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead>Stok</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredObat.map((o) => (
                            <TableRow key={o.id}>
                              <TableCell className="font-medium">{o.kode}</TableCell>
                              <TableCell>{o.nama}</TableCell>
                              <TableCell>{o.kategori}</TableCell>
                              <TableCell>{o.satuan}</TableCell>
                              <TableCell>
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(o.harga)}
                              </TableCell>
                              <TableCell>{o.stok}</TableCell>
                              <TableCell>
                                {o.stok <= 0 ? (
                                  <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error">Habis</Badge>
                                ) : o.stok <= o.minimum_stok ? (
                                  <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">Perlu Restock</Badge>
                                ) : (
                                  <Badge className="bg-status-success">Tersedia</Badge>
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
                                    <Link href={`/farmasi/obat/${o.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="h-8 bg-primary hover:bg-primary-dark"
                                    asChild
                                  >
                                    <Link href={`/farmasi/obat/${o.id}/edit`}>
                                      Edit
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-dark">
                      {searchQuery ? (
                        <p>Tidak ada hasil yang cocok dengan pencarian "{searchQuery}"</p>
                      ) : (
                        <p>Belum ada data obat. Silahkan tambahkan obat baru.</p>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
