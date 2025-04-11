import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, BarChart3, Calendar, Users, Activity, FileText, Pill } from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Legend,
  Cell
} from "recharts";

const COLORS = ["#00796b", "#00a9a0", "#00c7be", "#00d4c7", "#00ded0"];

export default function LaporanPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<"today" | "week" | "month" | "year">("month");
  const [reportType, setReportType] = useState<string>("kunjungan");
  
  // Sample data for charts
  const kunjunganData = [
    { name: "Jan", rawatJalan: 65, rawatInap: 28, total: 93 },
    { name: "Feb", rawatJalan: 59, rawatInap: 30, total: 89 },
    { name: "Mar", rawatJalan: 80, rawatInap: 25, total: 105 },
    { name: "Apr", rawatJalan: 81, rawatInap: 22, total: 103 },
    { name: "Mei", rawatJalan: 56, rawatInap: 27, total: 83 },
    { name: "Jun", rawatJalan: 55, rawatInap: 31, total: 86 },
    { name: "Jul", rawatJalan: 72, rawatInap: 29, total: 101 },
    { name: "Ags", rawatJalan: 60, rawatInap: 26, total: 86 },
    { name: "Sep", rawatJalan: 67, rawatInap: 34, total: 101 },
    { name: "Okt", rawatJalan: 70, rawatInap: 35, total: 105 },
    { name: "Nov", rawatJalan: 62, rawatInap: 30, total: 92 },
    { name: "Des", rawatJalan: 55, rawatInap: 25, total: 80 }
  ];
  
  const poliData = [
    { name: "Poli Umum", value: 150 },
    { name: "Poli Anak", value: 120 },
    { name: "Poli Jantung", value: 85 },
    { name: "Poli Mata", value: 65 },
    { name: "Poli Gigi", value: 70 }
  ];
  
  const obatData = [
    { name: "Jan", pengeluaran: 3500000, pendapatan: 4200000 },
    { name: "Feb", pengeluaran: 2900000, pendapatan: 3800000 },
    { name: "Mar", pengeluaran: 3200000, pendapatan: 4500000 },
    { name: "Apr", pengeluaran: 3800000, pendapatan: 4900000 },
    { name: "Mei", pengeluaran: 2700000, pendapatan: 3600000 },
    { name: "Jun", pengeluaran: 2900000, pendapatan: 3900000 }
  ];

  const reportTypes = [
    { icon: <Users className="mr-2 h-5 w-5" />, name: "Kunjungan Pasien", value: "kunjungan" },
    { icon: <Activity className="mr-2 h-5 w-5" />, name: "Distribusi Poli", value: "poli" },
    { icon: <Pill className="mr-2 h-5 w-5" />, name: "Penggunaan Obat", value: "obat" },
    { icon: <FileText className="mr-2 h-5 w-5" />, name: "Rekam Medis", value: "rekam-medis" }
  ];

  const handleDownloadReport = () => {
    toast({
      title: "Mengunduh Laporan",
      description: "Laporan sedang dipersiapkan untuk diunduh",
    });
    
    // Simulate download process
    setTimeout(() => {
      toast({
        title: "Laporan Siap",
        description: "Laporan berhasil diunduh",
      });
    }, 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header title="Laporan" subtitle="Laporan statistik rumah sakit" />

        <div className="px-4 md:px-6">
          <div className="mb-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                      Laporan dan Statistik
                    </CardTitle>
                    <CardDescription>
                      Analisis dan visualisasi data rumah sakit
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-neutral-dark" />
                      <Select
                        value={dateRange}
                        onValueChange={(value) => setDateRange(value as any)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Pilih rentang waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hari Ini</SelectItem>
                          <SelectItem value="week">Minggu Ini</SelectItem>
                          <SelectItem value="month">Bulan Ini</SelectItem>
                          <SelectItem value="year">Tahun Ini</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center"
                      onClick={handleDownloadReport}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      <span>Unduh Laporan</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {reportTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant={reportType === type.value ? "default" : "outline"}
                      className={`flex items-center justify-center h-16 ${
                        reportType === type.value 
                          ? "bg-primary hover:bg-primary-dark"
                          : "border-primary border-2 text-primary hover:bg-primary/10"
                      }`}
                      onClick={() => setReportType(type.value)}
                    >
                      {type.icon}
                      <span>{type.name}</span>
                    </Button>
                  ))}
                </div>
                
                {reportType === "kunjungan" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-neutral-darkest">Statistik Kunjungan Pasien</h3>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={kunjunganData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${value} Pasien`, undefined]}
                            labelFormatter={(label) => `Bulan: ${label}`}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="rawatJalan" 
                            name="Rawat Jalan"
                            stackId="1"
                            stroke="#00796b" 
                            fill="#00796b" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="rawatInap" 
                            name="Rawat Inap"
                            stackId="1"
                            stroke="#ff6b00" 
                            fill="#ff6b00" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Total Kunjungan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">1,124</div>
                          <p className="text-sm text-neutral-medium">Bulan ini</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Rawat Jalan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">832</div>
                          <p className="text-sm text-neutral-medium">74% dari total kunjungan</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Rawat Inap</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">292</div>
                          <p className="text-sm text-neutral-medium">26% dari total kunjungan</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {reportType === "poli" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-neutral-darkest">Distribusi Pasien per Poli</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={poliData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {poliData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} Pasien`, undefined]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base">Top 5 Poli Terbanyak</CardTitle>
                            <CardDescription>Berdasarkan jumlah kunjungan</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {poliData.map((poli, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium">{poli.name}</span>
                                    <span className="text-sm text-neutral-medium">{poli.value} pasien</span>
                                  </div>
                                  <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
                                    <div 
                                      className="h-full" 
                                      style={{ 
                                        width: `${(poli.value / Math.max(...poliData.map(d => d.value))) * 100}%`,
                                        backgroundColor: COLORS[index % COLORS.length]
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
                
                {reportType === "obat" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-neutral-darkest">Laporan Penggunaan dan Pendapatan Obat</h3>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={obatData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, undefined]}
                            labelFormatter={(label) => `Bulan: ${label}`}
                          />
                          <Legend />
                          <Bar 
                            dataKey="pengeluaran" 
                            name="Pengeluaran" 
                            fill="#ff6b00"
                          />
                          <Bar 
                            dataKey="pendapatan" 
                            name="Pendapatan" 
                            fill="#00796b" 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Total Pendapatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">Rp 24.900.000</div>
                          <p className="text-sm text-neutral-medium">6 bulan terakhir</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Total Pengeluaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">Rp 19.000.000</div>
                          <p className="text-sm text-neutral-medium">6 bulan terakhir</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle className="text-base">Keuntungan</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">Rp 5.900.000</div>
                          <p className="text-sm text-neutral-medium">23.7% margin</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {reportType === "rekam-medis" && (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="text-center mb-6">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-light" />
                      <h3 className="text-lg font-medium mb-2">Laporan Rekam Medis</h3>
                      <p className="text-neutral-medium max-w-md mx-auto">
                        Untuk mengunduh laporan rekam medis lengkap, silakan pilih periode waktu dan klik tombol di bawah ini.
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary-dark"
                      onClick={handleDownloadReport}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Unduh Laporan Rekam Medis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
