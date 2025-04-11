import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  Shield, 
  Hospital, 
  Users, 
  Settings, 
  Database,
  Key,
  RefreshCw 
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { performSync } from "@/lib/satu-sehat";

export default function PengaturanPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("umum");
  
  // Form for general settings
  const generalFormSchema = z.object({
    namaSarana: z.string().min(1, "Nama sarana harus diisi"),
    alamat: z.string().min(1, "Alamat harus diisi"),
    telepon: z.string().min(1, "Telepon harus diisi"),
    email: z.string().email("Email tidak valid"),
    logoUrl: z.string().optional(),
  });
  
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      namaSarana: "RSUD Harapan Bunda",
      alamat: "Jl. Kesehatan No. 123, Jakarta Selatan",
      telepon: "(021) 1234-5678",
      email: "info@rsud-harapanbunda.co.id",
      logoUrl: "",
    },
  });
  
  // Form for Satu Sehat integration
  const satuSehatFormSchema = z.object({
    clientId: z.string().min(1, "Client ID harus diisi"),
    clientSecret: z.string().min(1, "Client Secret harus diisi"),
    organizationId: z.string().min(1, "Organization ID harus diisi"),
    apiEndpoint: z.string().url("URL API tidak valid"),
    autoSync: z.boolean(),
    syncInterval: z.string(),
  });
  
  const satuSehatForm = useForm<z.infer<typeof satuSehatFormSchema>>({
    resolver: zodResolver(satuSehatFormSchema),
    defaultValues: {
      clientId: "satu_sehat_client_id",
      clientSecret: "•••••••••••••••••••",
      organizationId: "RS-1234567890",
      apiEndpoint: "https://api.satusehat.kemkes.go.id/fhir-r4/v1",
      autoSync: true,
      syncInterval: "daily",
    },
  });
  
  // Mock Satu Sehat sync mutation
  const syncMutation = useMutation({
    mutationFn: performSync,
    onSuccess: () => {
      toast({
        title: "Sinkronisasi Berhasil",
        description: "Data berhasil disinkronkan dengan Satu Sehat"
      });
    },
    onError: () => {
      toast({
        title: "Sinkronisasi Gagal",
        description: "Terjadi kesalahan saat sinkronisasi data",
        variant: "destructive"
      });
    }
  });
  
  // Mock form submissions
  const onGeneralSubmit = (data: z.infer<typeof generalFormSchema>) => {
    toast({
      title: "Pengaturan Disimpan",
      description: "Pengaturan umum berhasil diperbarui"
    });
  };
  
  const onSatuSehatSubmit = (data: z.infer<typeof satuSehatFormSchema>) => {
    toast({
      title: "Konfigurasi Disimpan",
      description: "Konfigurasi Satu Sehat berhasil diperbarui"
    });
  };
  
  // Mock test connection
  const handleTestConnection = () => {
    toast({
      title: "Testing Connection",
      description: "Menghubungkan ke API Satu Sehat...",
    });
    
    // Simulate connection test
    setTimeout(() => {
      toast({
        title: "Koneksi Berhasil",
        description: "Berhasil terhubung ke API Satu Sehat",
      });
    }, 2000);
  };
  
  const handleManualSync = () => {
    syncMutation.mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Pengaturan" subtitle="Konfigurasi sistem" />

        <div className="px-4 md:px-6 pb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Pengaturan Sistem</CardTitle>
                  <CardDescription>
                    Kelola konfigurasi SIMRS dan integrasi Satu Sehat
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="umum" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="umum" className="flex items-center">
                    <Hospital className="mr-2 h-4 w-4" />
                    Pengaturan Umum
                  </TabsTrigger>
                  <TabsTrigger value="satu-sehat" className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    Integrasi Satu Sehat
                  </TabsTrigger>
                  <TabsTrigger value="pengguna" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Manajemen Pengguna
                  </TabsTrigger>
                  <TabsTrigger value="keamanan" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Keamanan
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="umum" className="space-y-6">
                  <Form {...generalForm}>
                    <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={generalForm.control}
                          name="namaSarana"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Rumah Sakit</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nama rumah sakit" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="telepon"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telepon</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nomor telepon" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={generalForm.control}
                          name="logoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Logo</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan URL logo (opsional)" {...field} />
                              </FormControl>
                              <FormDescription>
                                Logo akan ditampilkan di header aplikasi
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={generalForm.control}
                        name="alamat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alamat</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Masukkan alamat lengkap" 
                                className="min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end">
                        <Button type="submit" className="bg-primary hover:bg-primary-dark">
                          Simpan Pengaturan
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="satu-sehat" className="space-y-6">
                  <Form {...satuSehatForm}>
                    <form onSubmit={satuSehatForm.handleSubmit(onSatuSehatSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={satuSehatForm.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan Client ID Satu Sehat" {...field} />
                              </FormControl>
                              <FormDescription>
                                Client ID dari Portal Pengembang Satu Sehat
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={satuSehatForm.control}
                          name="clientSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Secret</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Masukkan Client Secret" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={satuSehatForm.control}
                          name="organizationId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan Organization ID" {...field} />
                              </FormControl>
                              <FormDescription>
                                ID Fasilitas Kesehatan yang terdaftar di Satu Sehat
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={satuSehatForm.control}
                          name="apiEndpoint"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Endpoint</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan endpoint API Satu Sehat" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={satuSehatForm.control}
                          name="autoSync"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between p-3 border rounded-md shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel>Sinkronisasi Otomatis</FormLabel>
                                <FormDescription>
                                  Sinkronisasi data secara otomatis ke Satu Sehat
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={satuSehatForm.control}
                          name="syncInterval"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interval Sinkronisasi</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih interval sinkronisasi" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="hourly">Setiap jam</SelectItem>
                                  <SelectItem value="daily">Setiap hari</SelectItem>
                                  <SelectItem value="weekly">Setiap minggu</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex items-center"
                          onClick={handleTestConnection}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Tes Koneksi
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="flex items-center"
                          onClick={handleManualSync}
                          disabled={syncMutation.isPending}
                        >
                          {syncMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Sinkronisasi Manual
                        </Button>
                        
                        <Button type="submit" className="bg-primary hover:bg-primary-dark">
                          Simpan Konfigurasi
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="pengguna">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-neutral-light" />
                    <h3 className="text-lg font-medium mb-2">Manajemen Pengguna</h3>
                    <p className="text-neutral-medium max-w-md mx-auto mb-4">
                      Fitur manajemen pengguna hanya tersedia untuk administrator sistem
                    </p>
                    <Button className="bg-primary hover:bg-primary-dark">
                      Ke Halaman Manajemen Pengguna
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="keamanan">
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-neutral-light" />
                    <h3 className="text-lg font-medium mb-2">Keamanan Sistem</h3>
                    <p className="text-neutral-medium max-w-md mx-auto mb-4">
                      Fitur pengaturan keamanan hanya tersedia untuk administrator sistem
                    </p>
                    <Button className="bg-primary hover:bg-primary-dark">
                      Ke Halaman Keamanan
                    </Button>
                  </div>
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
