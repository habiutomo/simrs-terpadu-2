import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { FolderSync, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SATU_SEHAT_STATUS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { type SatuSehatSync } from "@shared/schema";

const SyncItem: React.FC<{
  label: string;
  value: number;
  status: string;
  color: "success" | "warning" | "error";
}> = ({ label, value, status, color }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case "success":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "error":
        return "bg-error";
      default:
        return "bg-neutral-500";
    }
  };
  
  const getTextColorClass = (color: string) => {
    switch (color) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-error";
      default:
        return "text-neutral-500";
    }
  };
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-neutral-600">{label}</p>
        <span className={`${getTextColorClass(color)} text-sm`}>{status}</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div 
          className={`${getColorClass(color)} rounded-full h-2`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );
};

const SatuSehatIndex: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: syncStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/satu-sehat/stats"],
  });
  
  const { data: syncHistory, isLoading: historyLoading } = useQuery<SatuSehatSync[]>({
    queryKey: ["/api/satu-sehat-sync"],
    // Disable this query since we don't have the endpoint yet
    enabled: false,
  });
  
  const syncMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/satu-sehat/sync", {}),
    onSuccess: async () => {
      toast({
        title: "Sinkronisasi berhasil",
        description: "Data telah berhasil disinkronisasi dengan Satu Sehat",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/satu-sehat/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal sinkronisasi",
        description: error.message || "Terjadi kesalahan saat sinkronisasi data",
        variant: "destructive",
      });
    },
  });
  
  const handleSync = () => {
    syncMutation.mutate();
  };
  
  const historyColumns: ColumnDef<SatuSehatSync>[] = [
    {
      accessorKey: "entityType",
      header: "Tipe Data",
      cell: ({ row }) => {
        const entityType = row.getValue("entityType") as string;
        const entityTypeLabels: Record<string, string> = {
          "patient": "Pasien",
          "medical_record": "Rekam Medis",
          "medication": "Obat",
          "prescription": "Resep"
        };
        
        return <div>{entityTypeLabels[entityType] || entityType}</div>;
      },
    },
    {
      accessorKey: "entityId",
      header: "ID Entitas",
    },
    {
      accessorKey: "syncStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("syncStatus") as string;
        
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "success":
              return "success";
            case "failed":
              return "destructive";
            case "pending":
              return "warning";
            default:
              return "default";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status) {
            case "success": return "Berhasil";
            case "failed": return "Gagal";
            case "pending": return "Menunggu";
            default: return status;
          }
        };
        
        return (
          <Badge variant={getStatusVariant(status) as any}>
            {getStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "syncDate",
      header: "Tanggal Sinkronisasi",
      cell: ({ row }) => {
        const date = row.getValue("syncDate") as string;
        if (!date) return <div>-</div>;
        return <div>{format(new Date(date), "dd/MM/yyyy HH:mm")}</div>;
      },
    },
    {
      accessorKey: "syncMessage",
      header: "Pesan",
      cell: ({ row }) => <div>{row.getValue("syncMessage") || "-"}</div>,
    },
    {
      accessorKey: "retryCount",
      header: "Jumlah Percobaan",
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Integrasi Satu Sehat</h1>
        
        <Button onClick={handleSync} disabled={syncMutation.isPending}>
          <FolderSync className="h-4 w-4 mr-2" />
          {syncMutation.isPending ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Ringkasan</TabsTrigger>
          <TabsTrigger value="history">Riwayat Sinkronisasi</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Status Sinkronisasi</CardTitle>
                <CardDescription>
                  Status sinkronisasi data dengan Satu Sehat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
                  </div>
                ) : (
                  <div>
                    {SATU_SEHAT_STATUS.map((item, index) => (
                      <SyncItem 
                        key={index}
                        label={item.label}
                        value={item.value}
                        status={item.status}
                        color={item.color as "success" | "warning" | "error"}
                      />
                    ))}
                    
                    <div className="mt-8">
                      <h3 className="font-medium mb-4">Statistik Detail</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-neutral-100 p-4 rounded-md">
                          <p className="text-sm text-neutral-500">Total Pasien</p>
                          <div className="flex justify-between mt-1">
                            <p className="font-semibold">
                              {syncStats?.patients?.synced || 0} / {syncStats?.patients?.total || 0}
                            </p>
                            <span className="text-success text-sm">
                              {syncStats?.patients?.total ? 
                                `${Math.round((syncStats.patients.synced / syncStats.patients.total) * 100)}%` : 
                                '0%'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-100 p-4 rounded-md">
                          <p className="text-sm text-neutral-500">Rekam Medis</p>
                          <div className="flex justify-between mt-1">
                            <p className="font-semibold">
                              {syncStats?.medicalRecords?.synced || 0} / {syncStats?.medicalRecords?.total || 0}
                            </p>
                            <span className="text-warning text-sm">
                              {syncStats?.medicalRecords?.total ? 
                                `${Math.round((syncStats.medicalRecords.synced / syncStats.medicalRecords.total) * 100)}%` : 
                                '0%'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-100 p-4 rounded-md">
                          <p className="text-sm text-neutral-500">Data Obat</p>
                          <div className="flex justify-between mt-1">
                            <p className="font-semibold">
                              {syncStats?.medications?.synced || 0} / {syncStats?.medications?.total || 0}
                            </p>
                            <span className="text-error text-sm">
                              {syncStats?.medications?.total ? 
                                `${Math.round((syncStats.medications.synced / syncStats.medications.total) * 100)}%` : 
                                '0%'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-neutral-100 p-4 rounded-md">
                          <p className="text-sm text-neutral-500">Resep Obat</p>
                          <div className="flex justify-between mt-1">
                            <p className="font-semibold">
                              {syncStats?.prescriptions?.synced || 0} / {syncStats?.prescriptions?.total || 0}
                            </p>
                            <span className="text-success text-sm">
                              {syncStats?.prescriptions?.total ? 
                                `${Math.round((syncStats.prescriptions.synced / syncStats.prescriptions.total) * 100)}%` : 
                                '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={handleSync} 
                  disabled={syncMutation.isPending}
                >
                  <FolderSync className="h-4 w-4 mr-2" />
                  {syncMutation.isPending ? "Menyinkronkan..." : "Sinkronisasi Semua Data"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informasi Satu Sehat</CardTitle>
                <CardDescription>
                  Tentang integrasi Satu Sehat
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Apa itu Satu Sehat?</AlertTitle>
                  <AlertDescription>
                    Satu Sehat adalah platform interoperabilitas data kesehatan nasional 
                    yang dikembangkan oleh Kementerian Kesehatan Republik Indonesia.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="font-medium mb-2">Manfaat Integrasi</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Pertukaran data kesehatan yang aman dan terstandar</li>
                    <li>Akses riwayat kesehatan pasien secara nasional</li>
                    <li>Peningkatan kualitas layanan kesehatan</li>
                    <li>Dukungan untuk analisis data kesehatan nasional</li>
                    <li>Kepatuhan terhadap regulasi kesehatan nasional</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Status Koneksi</h3>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span>Terhubung dengan Satu Sehat</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Sinkronisasi</CardTitle>
              <CardDescription>
                Catatan aktivitas sinkronisasi data dengan Satu Sehat
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center items-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
              ) : syncHistory && syncHistory.length > 0 ? (
                <DataTable 
                  columns={historyColumns} 
                  data={syncHistory} 
                  searchKey="entityType"
                  searchPlaceholder="Cari tipe data..."
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <FolderSync className="h-16 w-16 text-neutral-300" />
                  <p className="text-neutral-500">Belum ada data sinkronisasi</p>
                  <Button onClick={handleSync} disabled={syncMutation.isPending}>
                    {syncMutation.isPending ? "Menyinkronkan..." : "Sinkronisasi Sekarang"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Satu Sehat</CardTitle>
              <CardDescription>
                Konfigurasi integrasi Satu Sehat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informasi</AlertTitle>
                <AlertDescription>
                  Pengaturan ini memerlukan kredensial yang valid dari Satu Sehat. 
                  Pastikan Anda telah terdaftar sebagai fasilitas kesehatan yang terintegrasi.
                </AlertDescription>
              </Alert>
              
              <div className="bg-neutral-100 p-4 rounded-md">
                <h3 className="font-medium mb-2">Status Kredensial</h3>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span>Kredensial valid dan aktif</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Pengaturan Sinkronisasi</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-md">
                    <span>Sinkronisasi Otomatis</span>
                    <span className="text-success">Aktif</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-md">
                    <span>Interval Sinkronisasi</span>
                    <span>Setiap 12 jam</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-md">
                    <span>Jumlah Percobaan</span>
                    <span>3 kali</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-neutral-500 mt-4">
                Pengaturan integrasi lanjutan dapat dilakukan oleh administrator sistem.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SatuSehatIndex;
