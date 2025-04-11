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
import { Loader2, Search, UserPlus, Calendar, FileText } from "lucide-react";
import { Pasien } from "@shared/schema";

export default function PasienPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pasien, isLoading } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const filteredPasien = pasien?.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nomorRM.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nik.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Riwayat Kunjungan Pasien" subtitle="Kelola data kunjungan pasien" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Daftar Riwayat Kunjungan</CardTitle>
                  <CardDescription>
                    Lihat dan kelola riwayat kunjungan pasien
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
                      Pendaftaran Baru
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
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Tanggal Lahir</TableHead>
                        <TableHead>Alamat</TableHead>
                        <TableHead>Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPasien.map((pasien) => (
                        <TableRow key={pasien.id}>
                          <TableCell className="font-medium">{pasien.nomorRM}</TableCell>
                          <TableCell>{pasien.nama}</TableCell>
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
                          <TableCell className="max-w-[200px] truncate">
                            {pasien.alamat}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                asChild
                              >
                                <Link href={`/rekam-medis?pasienId=${pasien.id}`}>
                                  <FileText className="mr-1 h-4 w-4 text-neutral-dark" />
                                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Rekam Medis
                                  </span>
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                asChild
                              >
                                <Link href={`/jadwal?pasienId=${pasien.id}`}>
                                  <Calendar className="mr-1 h-4 w-4 text-neutral-dark" />
                                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Jadwalkan
                                  </span>
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
                    <p>Belum ada data pasien. Silahkan lakukan pendaftaran pasien baru.</p>
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
