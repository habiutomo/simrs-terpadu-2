import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Shield, 
  Database, 
  Settings as SettingsIcon 
} from "lucide-react";

const Settings: React.FC = () => {
  const { toast } = useToast();
  
  const profileForm = useForm({
    defaultValues: {
      name: "Dr. Rahmat",
      email: "dr.rahmat@hospital.com",
      phone: "081234567890",
    }
  });
  
  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });
  
  const hospitalForm = useForm({
    defaultValues: {
      hospitalName: "Rumah Sakit Example",
      address: "Jl. Contoh No. 123, Jakarta",
      phone: "021-12345678",
      email: "info@rs-example.com",
      website: "https://rs-example.com",
      logo: "",
    }
  });
  
  const handleProfileSubmit = (data: any) => {
    toast({
      title: "Profil berhasil diperbarui",
      description: "Perubahan profil Anda telah disimpan",
    });
  };
  
  const handlePasswordSubmit = (data: any) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Password baru dan konfirmasi password harus sama",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Password berhasil diperbarui",
      description: "Password Anda telah berhasil diubah",
    });
  };
  
  const handleHospitalSubmit = (data: any) => {
    toast({
      title: "Informasi rumah sakit diperbarui",
      description: "Perubahan informasi rumah sakit telah disimpan",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-2" />Profil</TabsTrigger>
          <TabsTrigger value="security"><Lock className="h-4 w-4 mr-2" />Keamanan</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifikasi</TabsTrigger>
          <TabsTrigger value="hospital"><Globe className="h-4 w-4 mr-2" />Rumah Sakit</TabsTrigger>
          <TabsTrigger value="system"><SettingsIcon className="h-4 w-4 mr-2" />Sistem</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
                      DR
                    </div>
                    <Button variant="outline" type="button">
                      Ubah Foto
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...profileForm.register("email")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        {...profileForm.register("phone")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Peran</Label>
                      <Input
                        id="role"
                        value="Dokter Umum"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Simpan Perubahan
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
              <CardDescription>
                Kelola password dan keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Ubah Password</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Password Saat Ini</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        {...passwordForm.register("currentPassword")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Password Baru</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        {...passwordForm.register("newPassword")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        {...passwordForm.register("confirmPassword")}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-lg font-medium">Keamanan Lanjutan</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Verifikasi Dua Faktor</Label>
                        <p className="text-sm text-neutral-500">
                          Tambahkan lapisan keamanan tambahan ke akun Anda
                        </p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notifikasi Login</Label>
                        <p className="text-sm text-neutral-500">
                          Dapatkan notifikasi ketika ada upaya login baru
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Simpan Perubahan
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifikasi</CardTitle>
              <CardDescription>
                Kelola preferensi notifikasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Email</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Janji Dokter</Label>
                      <p className="text-sm text-neutral-500">
                        Notifikasi untuk janji dokter baru dan perubahan jadwal
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rekam Medis</Label>
                      <p className="text-sm text-neutral-500">
                        Notifikasi untuk rekam medis baru dan pembaruan
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Resep & Farmasi</Label>
                      <p className="text-sm text-neutral-500">
                        Notifikasi untuk resep baru dan status obat
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tagihan & Pembayaran</Label>
                      <p className="text-sm text-neutral-500">
                        Notifikasi untuk invoice dan status pembayaran
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="pt-4 border-t space-y-4">
                  <h3 className="text-lg font-medium">Sistem</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notifikasi Aplikasi</Label>
                      <p className="text-sm text-neutral-500">
                        Tampilkan notifikasi dalam aplikasi
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Suara Notifikasi</Label>
                      <p className="text-sm text-neutral-500">
                        Aktifkan suara untuk notifikasi penting
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button>
                    Simpan Preferensi
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hospital">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Rumah Sakit</CardTitle>
              <CardDescription>
                Kelola informasi dan pengaturan rumah sakit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={hospitalForm.handleSubmit(handleHospitalSubmit)}>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-md bg-primary flex items-center justify-center text-white text-2xl">
                      RS
                    </div>
                    <Button variant="outline" type="button">
                      Ubah Logo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="hospitalName">Nama Rumah Sakit</Label>
                      <Input
                        id="hospitalName"
                        {...hospitalForm.register("hospitalName")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...hospitalForm.register("email")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        {...hospitalForm.register("phone")}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        {...hospitalForm.register("website")}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        rows={3}
                        {...hospitalForm.register("address")}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-lg font-medium">Pengaturan Satu Sehat</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="satuSehatId">ID Fasilitas Satu Sehat</Label>
                        <Input
                          id="satuSehatId"
                          value="FS-1234567890"
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="organizationType">Tipe Organisasi</Label>
                        <Select defaultValue="rs">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rs">Rumah Sakit</SelectItem>
                            <SelectItem value="puskesmas">Puskesmas</SelectItem>
                            <SelectItem value="klinik">Klinik</SelectItem>
                            <SelectItem value="praktik">Praktik Dokter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Simpan Perubahan
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Sistem</CardTitle>
                <CardDescription>
                  Kelola pengaturan sistem dan tampilan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Tampilan</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="theme">Tema</Label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Terang</SelectItem>
                          <SelectItem value="dark">Gelap</SelectItem>
                          <SelectItem value="system">Ikuti Sistem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Bahasa</Label>
                      <Select defaultValue="id">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">Bahasa Indonesia</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeZone">Zona Waktu</Label>
                      <Select defaultValue="asia_jakarta">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia_jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                          <SelectItem value="asia_makassar">Asia/Makassar (GMT+8)</SelectItem>
                          <SelectItem value="asia_jayapura">Asia/Jayapura (GMT+9)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-lg font-medium">Preferensi</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-save Data</Label>
                        <p className="text-sm text-neutral-500">
                          Simpan data otomatis saat mengisi formulir
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Konfirmasi Sebelum Logout</Label>
                        <p className="text-sm text-neutral-500">
                          Minta konfirmasi sebelum keluar dari aplikasi
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Backup & Keamanan Data</CardTitle>
                <CardDescription>
                  Kelola backup dan keamanan data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Backup Data</h3>
                    
                    <div className="bg-neutral-100 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Status Backup Terakhir</span>
                        <span className="text-success">Berhasil</span>
                      </div>
                      <p className="text-sm text-neutral-500">
                        12 Juni 2023, 23:45 WIB
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frekuensi Backup</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Setiap Jam</SelectItem>
                          <SelectItem value="daily">Harian</SelectItem>
                          <SelectItem value="weekly">Mingguan</SelectItem>
                          <SelectItem value="monthly">Bulanan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button className="w-full">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Manual Sekarang
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t space-y-4">
                    <h3 className="text-lg font-medium">Keamanan Data</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Enkripsi Data Pasien</Label>
                        <p className="text-sm text-neutral-500">
                          Selalu enkripsi data sensitif pasien
                        </p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Log Aktivitas Sistem</Label>
                        <p className="text-sm text-neutral-500">
                          Catat semua aktivitas pengguna di sistem
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Audit Keamanan Sistem
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
