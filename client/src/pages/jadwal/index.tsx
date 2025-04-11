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
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Plus, Calendar } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertJadwalSchema, Jadwal, Pasien, User } from "@shared/schema";

// Extending the schema to accept string date
const jadwalFormSchema = z.object({
  pasienId: z.string().or(z.number()).pipe(z.coerce.number()),
  dokterUserId: z.string().or(z.number()).pipe(z.coerce.number()),
  tanggal: z.string(),
  waktu: z.string(),
  jenisPelayanan: z.string(),
  namaLayanan: z.string(),
  keterangan: z.string().optional(),
});

type JadwalFormValues = z.infer<typeof jadwalFormSchema>;

export default function JadwalPage() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  // Get query parameters
  const params = new URLSearchParams(location.split("?")[1]);
  const pasienIdParam = params.get("pasienId");

  const { data: jadwal, isLoading: isLoadingJadwal } = useQuery<Jadwal[]>({
    queryKey: ['/api/jadwal'],
  });

  const { data: pasien, isLoading: isLoadingPasien } = useQuery<Pasien[]>({
    queryKey: ['/api/pasien'],
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Filter doctors from users
  const dokter = users?.filter(user => user.role === "dokter");

  const form = useForm<JadwalFormValues>({
    resolver: zodResolver(jadwalFormSchema),
    defaultValues: {
      pasienId: pasienIdParam ? parseInt(pasienIdParam) : "",
      dokterUserId: "",
      tanggal: "",
      waktu: "",
      jenisPelayanan: "",
      namaLayanan: "",
      keterangan: "",
    }
  });

  const filteredJadwal = jadwal?.filter(j => {
    // Filter by search query
    const pasienData = pasien?.find(p => p.id === j.pasienId);
    const dokterData = users?.find(u => u.id === j.dokterUserId);
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      pasienData?.nama.toLowerCase().includes(searchLower) ||
      dokterData?.nama.toLowerCase().includes(searchLower) ||
      j.namaLayanan.toLowerCase().includes(searchLower);
    
    // Filter by tab
    const matchesTab = activeTab === "semua" || 
      (activeTab === "poli" && j.jenisPelayanan === "poli") ||
      (activeTab === "lab" && j.jenisPelayanan === "laboratorium") ||
      (activeTab === "radiologi" && j.jenisPelayanan === "radiologi");
    
    return matchesSearch && matchesTab;
  });

  const isLoading = isLoadingJadwal || isLoadingPasien || isLoadingUsers;

  const onSubmit = async (data: JadwalFormValues) => {
    try {
      // Combine date and time
      const [year, month, day] = data.tanggal.split('-');
      const [hour, minute] = data.waktu.split(':');
      const tanggal = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
      );
      
      const jadwalData = {
        pasienId: data.pasienId,
        dokterUserId: data.dokterUserId,
        tanggal,
        jenisPelayanan: data.jenisPelayanan,
        namaLayanan: data.namaLayanan,
        keterangan: data.keterangan,
      };
      
      await apiRequest("POST", "/api/jadwal", jadwalData);
      
      toast({
        title: "Jadwal Berhasil Dibuat",
        description: "Jadwal kunjungan berhasil ditambahkan",
      });
      
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/jadwal'] });
    } catch (error) {
      toast({
        title: "Gagal Membuat Jadwal",
        description: "Terjadi kesalahan saat membuat jadwal",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "konfirmasi":
        return <Badge className="bg-status-success">Konfirmasi</Badge>;
      case "menunggu":
        return <Badge variant="outline" className="bg-status-warning/10 text-status-warning border-status-warning">Menunggu</Badge>;
      case "batal":
        return <Badge variant="outline" className="bg-status-error/10 text-status-error border-status-error">Batal</Badge>;
      case "selesai":
        return <Badge variant="outline" className="bg-neutral-light/50 text-neutral-dark border-neutral-dark">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Jadwal & Appointment" subtitle="Kelola jadwal kunjungan pasien" />

        <div className="px-4 md:px-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Jadwal Kunjungan</CardTitle>
                  <CardDescription>
                    Lihat dan kelola jadwal kunjungan pasien
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-medium" />
                    <Input
                      type="search"
                      placeholder="Cari jadwal..."
                      className="pl-8 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary-dark">
                        <Plus className="mr-2 h-4 w-4" />
                        Jadwal Baru
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Buat Jadwal Kunjungan Baru</DialogTitle>
                        <DialogDescription>
                          Isi data jadwal kunjungan pasien dengan lengkap.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                          <FormField
                            control={form.control}
                            name="pasienId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pasien <span className="text-destructive">*</span></FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih pasien" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
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
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dokterUserId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dokter <span className="text-destructive">*</span></FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value.toString()}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih dokter" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {isLoadingUsers ? (
                                      <div className="flex justify-center p-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      </div>
                                    ) : (
                                      dokter?.map((d) => (
                                        <SelectItem key={d.id} value={d.id.toString()}>
                                          {d.nama}
                                        </SelectItem>
                                      ))
                                    )}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="tanggal"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tanggal <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="waktu"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Waktu <span className="text-destructive">*</span></FormLabel>
                                  <FormControl>
                                    <Input type="time" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="jenisPelayanan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jenis Pelayanan <span className="text-destructive">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih jenis pelayanan" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="poli">Poli</SelectItem>
                                    <SelectItem value="laboratorium">Laboratorium</SelectItem>
                                    <SelectItem value="radiologi">Radiologi</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="namaLayanan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nama Layanan <span className="text-destructive">*</span></FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan nama layanan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="keterangan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Keterangan</FormLabel>
                                <FormControl>
                                  <Input placeholder="Masukkan keterangan tambahan (opsional)" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Batal
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary-dark">
                              Simpan Jadwal
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="semua" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="poli">Poli</TabsTrigger>
                  <TabsTrigger value="lab">Laboratorium</TabsTrigger>
                  <TabsTrigger value="radiologi">Radiologi</TabsTrigger>
                </TabsList>
                
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredJadwal && filteredJadwal.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Pasien</TableHead>
                          <TableHead>Dokter</TableHead>
                          <TableHead>Layanan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Tindakan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredJadwal.map((j) => {
                          const pasienData = pasien?.find(p => p.id === j.pasienId);
                          const dokterData = users?.find(u => u.id === j.dokterUserId);
                          const tanggal = new Date(j.tanggal);
                          
                          return (
                            <TableRow key={j.id}>
                              <TableCell>
                                {tanggal.toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                {tanggal.toLocaleTimeString("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </TableCell>
                              <TableCell>{pasienData?.nama || "-"}</TableCell>
                              <TableCell>{dokterData?.nama || "-"}</TableCell>
                              <TableCell>
                                {j.jenisPelayanan === "poli" ? "Poli" : j.jenisPelayanan === "laboratorium" ? "Lab" : "Radiologi"}{" "}
                                {j.namaLayanan}
                              </TableCell>
                              <TableCell>{getStatusBadge(j.status)}</TableCell>
                              <TableCell className="max-w-[150px] truncate">
                                {j.keterangan || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8"
                                  asChild
                                >
                                  <Link href={`/jadwal/${j.id}`}>
                                    <Calendar className="mr-1 h-4 w-4 text-neutral-dark" />
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
                    {searchQuery ? (
                      <p>Tidak ada hasil yang cocok dengan pencarian "{searchQuery}"</p>
                    ) : (
                      <p>Belum ada jadwal kunjungan. Silahkan buat jadwal baru.</p>
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
