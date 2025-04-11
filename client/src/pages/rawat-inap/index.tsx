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
import { Loader2, Search, FilePlus, BedIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RawatInap, Pasien, User } from "@shared/schema";

export default function RawatInapPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  const { data: rawatInap, isLoading: isLoadingRawatInap } = useQuery<RawatInap[]>({
    queryKey: ['/api/rawat-inap'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Filter based on tab and search
  const filteredRawatInap = rawatInap?.filter(ri => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === ri.pasienId);
    const dokterData = users?.find(u => u.id === ri.dokterPenanggungJawab);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      pasienData?.nama.toLowerCase().includes(searchLower) ||
      dokterData?.nama.toLowerCase().includes(searchLower) ||
      ri.ruangan.toLowerCase().includes(searchLower) ||
      ri.nomorBed.toLowerCase().includes(searchLower);
    
    // Filter by tab
    const matchesTab = activeTab === "semua" || 
      (activeTab === "aktif" && ri.status === "aktif") ||
      (activeTab === "selesai" && ri.status === "selesai");
    
    return matchesSearch && matchesTab;
  });

  const isLoading = isLoadingRawatInap || isLoadingPasien || isLoadingUsers;

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Rawat Inap" subtitle="Kelola pasien rawat inap" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pasien Rawat Inap</CardTitle>
                  <CardDescription>
                    Lihat dan kelola data pasien rawat inap
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
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <BedIcon className="mr-2 h-4 w-4" />
                        Pasien Baru
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pendaftaran Rawat Inap Baru</DialogTitle>
                        <DialogDescription>
                          Silahkan isi formulir pendaftaran rawat inap terlebih dahulu
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <p>Anda akan diarahkan ke formulir pendaftaran rawat inap.</p>
                      </div>
                      <DialogFooter>
                        <Link href="/rawat-inap/pendaftaran">
                          <Button className="bg-primary hover:bg-primary-dark">
                            Lanjutkan ke Pendaftaran
                          </Button>
                        </Link>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="semua" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="aktif">Aktif</TabsTrigger>
                  <TabsTrigger value="selesai">Selesai</TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredRawatInap && filteredRawatInap.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pasien</TableHead>
                          <TableHead>No. RM</TableHead>
                          <TableHead>Dokter PJ</TableHead>
                          <TableHead>Tanggal Masuk</TableHead>
                          <TableHead>Ruangan / Bed</TableHead>
                          <TableHead>Diagnosis Awal</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRawatInap.map((ri) => {
                          const pasienData = pasien?.find(p => p.id === ri.pasienId);
                          const dokterData = users?.find(u => u.id === ri.dokterPenanggungJawab);
                          
                          return (
                            <TableRow key={ri.id}>
                              <TableCell className="font-medium">{pasienData?.nama || "-"}</TableCell>
                              <TableCell>{pasienData?.nomorRM || "-"}</TableCell>
                              <TableCell>{dokterData?.nama || "-"}</TableCell>
                              <TableCell>
                                {new Date(ri.tanggalMasuk).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                {ri.ruangan} / {ri.nomorBed}
                              </TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {ri.diagnosisAwal}
                              </TableCell>
                              <TableCell>
                                {ri.status === "aktif" ? (
                                  <Badge className="bg-status-info">Aktif</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-neutral-light/50 text-neutral-dark border-neutral-dark">Selesai</Badge>
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
                                    <Link href={`/rawat-inap/${ri.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                  {ri.status === "aktif" && (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="h-8 bg-primary hover:bg-primary-dark"
                                      asChild
                                    >
                                      <Link href={`/rekam-medis/buat?pasienId=${ri.pasienId}&rawatInapId=${ri.id}`}>
                                        Rekam Medis
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
                    ) : activeTab === "aktif" ? (
                      <p>Tidak ada pasien rawat inap yang sedang aktif.</p>
                    ) : activeTab === "selesai" ? (
                      <p>Belum ada riwayat pasien rawat inap yang telah selesai.</p>
                    ) : (
                      <p>Belum ada data rawat inap. Silahkan tambahkan pasien baru.</p>
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
