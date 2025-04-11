import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, MoreVertical, Edit, FileText, Calendar, Trash } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pasien } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DataPasien() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: pasien, isLoading } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const filteredPasien = pasien?.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nomorRM.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePasien = async () => {
    if (!deleteId) return;
    
    try {
      await apiRequest("DELETE", `/api/pasien/${deleteId}`);
      
      toast({
        title: "Berhasil",
        description: "Data pasien berhasil dihapus",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/pasien'] });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Terjadi kesalahan saat menghapus data pasien",
        variant: "destructive",
      });
    } finally {
      setIsAlertOpen(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setIsAlertOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Data Pasien" subtitle="Kelola data pasien yang terdaftar" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Pasien</CardTitle>
                  <CardDescription>
                    Lihat dan kelola data pasien terdaftar
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
                  <Link href="/pasien/pendaftaran">
                    <Button className="bg-primary hover:bg-primary-dark">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Pasien Baru
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredPasien && filteredPasien.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. RM</TableHead>
                        <TableHead>Nama Pasien</TableHead>
                        <TableHead>NIK</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Tanggal Lahir</TableHead>
                        <TableHead>Status Sinkronisasi</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead className="text-right">Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPasien.map((pasien) => (
                        <TableRow key={pasien.id}>
                          <TableCell className="font-medium">{pasien.nomorRM}</TableCell>
                          <TableCell>{pasien.nama}</TableCell>
                          <TableCell>{pasien.nik}</TableCell>
                          <TableCell>
                            {pasien.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                          </TableCell>
                          <TableCell>
                            {new Date(pasien.tanggalLahir).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>
                            {pasien.statusSinkronisasi === "selesai" ? (
                              <Badge className="bg-status-success">Sinkronisasi</Badge>
                            ) : pasien.statusSinkronisasi === "proses" ? (
                              <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">Proses</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-neutral-light/50 text-neutral-dark border-neutral-dark">Belum</Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {pasien.alamat}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Buka menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/pasien/edit/${pasien.id}`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit Data</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/rekam-medis?pasienId=${pasien.id}`}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>Rekam Medis</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/jadwal?pasienId=${pasien.id}`}>
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Jadwalkan</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => confirmDelete(pasien.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Hapus</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                    <p>Belum ada data pasien. Silahkan lakukan pendaftaran pasien baru.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Pasien</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data pasien ini? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pasien.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePasien}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileNav />
    </div>
  );
}
