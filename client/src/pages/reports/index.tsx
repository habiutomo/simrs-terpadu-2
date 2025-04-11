import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, BarChart, Bar, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const generateMonthlyOptions = () => {
  const options = [];
  const today = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = subMonths(today, i);
    const value = format(date, "yyyy-MM");
    const label = format(date, "MMMM yyyy");
    options.push({ value, label });
  }
  
  return options;
};

const monthlyOptions = generateMonthlyOptions();

// Color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const ReportsIndex: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(monthlyOptions[0].value);
  
  // Parse the selected month to get start and end dates
  const startDate = format(startOfMonth(parseISO(`${selectedMonth}-01`)), "yyyy-MM-dd");
  const endDate = format(endOfMonth(parseISO(`${selectedMonth}-01`)), "yyyy-MM-dd");
  
  // Query for report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", { startDate, endDate }],
    queryFn: async () => {
      // In a real implementation, this would call a backend endpoint
      // For now, return sample data
      return {
        patientVisits: [
          { name: "Konsultasi", value: 65 },
          { name: "Pemeriksaan", value: 40 },
          { name: "Kontrol", value: 25 },
          { name: "Tindakan", value: 15 },
        ],
        revenue: [
          { name: "Minggu 1", value: 8500000 },
          { name: "Minggu 2", value: 7200000 },
          { name: "Minggu 3", value: 9800000 },
          { name: "Minggu 4", value: 11500000 },
        ],
        topMedications: [
          { name: "Paracetamol", value: 120 },
          { name: "Amoxicillin", value: 85 },
          { name: "Omeprazole", value: 65 },
          { name: "Ibuprofen", value: 50 },
          { name: "Cetirizine", value: 45 },
        ],
        topDiagnoses: [
          { name: "ISPA", value: 45 },
          { name: "Hipertensi", value: 35 },
          { name: "Diabetes", value: 28 },
          { name: "Gastritis", value: 22 },
          { name: "Dermatitis", value: 18 },
        ],
        statusDistribution: [
          { name: "Aktif", value: 850 },
          { name: "Tidak Aktif", value: 150 },
        ],
        syncStatus: [
          { name: "Tersinkronisasi", value: 750 },
          { name: "Belum Sinkron", value: 250 },
        ],
      };
    },
  });
  
  const handleExportPDF = () => {
    // In a real implementation, this would generate and download a PDF report
    alert("Fitur ekspor laporan ke PDF akan diimplementasikan");
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data laporan...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Laporan</h1>
        
        <div className="flex items-center gap-4">
          <Select 
            value={selectedMonth} 
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthlyOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Ekspor PDF
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="visits" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visits">Kunjungan</TabsTrigger>
          <TabsTrigger value="revenue">Pendapatan</TabsTrigger>
          <TabsTrigger value="medications">Obat & Diagnosa</TabsTrigger>
          <TabsTrigger value="satu-sehat">Satu Sehat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visits">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kunjungan</CardTitle>
                <CardDescription>
                  Distribusi kunjungan berdasarkan jenis kunjungan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData?.patientVisits}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData?.patientVisits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} kunjungan`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Statistik Pasien</CardTitle>
                <CardDescription>
                  Distribusi status pasien
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData?.statusDistribution}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => [`${value} pasien`, ""]} />
                      <Legend />
                      <Bar dataKey="value" name="Jumlah Pasien" fill="#0078D4">
                        {reportData?.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#0078D4" : "#FF8042"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Grafik Pendapatan</CardTitle>
              <CardDescription>
                Pendapatan rumah sakit per minggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData?.revenue}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      tickFormatter={(value) => 
                        new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value)
                      }
                    />
                    <Tooltip 
                      formatter={(value) => [
                        new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(value as number),
                        "Pendapatan"
                      ]}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="value" name="Pendapatan" stroke="#0078D4" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medications">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Obat</CardTitle>
                <CardDescription>
                  Obat yang paling banyak diresepkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData?.topMedications}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} resep`, ""]} />
                      <Legend />
                      <Bar dataKey="value" name="Jumlah Resep" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Diagnosa</CardTitle>
                <CardDescription>
                  Diagnosa yang paling sering ditemukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData?.topDiagnoses}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kasus`, ""]} />
                      <Legend />
                      <Bar dataKey="value" name="Jumlah Kasus" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="satu-sehat">
          <Card>
            <CardHeader>
              <CardTitle>Status Integrasi Satu Sehat</CardTitle>
              <CardDescription>
                Persentase data yang tersinkronisasi dengan Satu Sehat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData?.syncStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData?.syncStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#00C49F" : "#FF8042"} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} data`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsIndex;
