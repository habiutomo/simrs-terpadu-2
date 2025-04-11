import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { performSync, type SatuSehatStatus } from "@/lib/satu-sehat";

interface IntegrationStatusProps {
  status?: SatuSehatStatus;
}

export default function IntegrationStatus({ status }: IntegrationStatusProps) {
  const { toast } = useToast();
  
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
  
  const handleSync = () => {
    syncMutation.mutate();
  };
  
  // Default values when data is not available
  const defaultStatus = {
    status: "terhubung",
    dataSync: {
      total: 0,
      synced: 0,
      percentage: 0
    },
    fhirResources: {
      total: 0,
      available: 0,
      percentage: 0
    },
    connection: {
      status: "terhubung",
      responseTime: "0ms",
      uptime: "0%"
    },
    validation: {
      total: 0,
      validated: 0,
      percentage: 0
    },
    lastSync: new Date()
  };
  
  const data = status || defaultStatus;
  
  // Format last sync time
  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours} jam yang lalu`;
    } else if (diffMins > 0) {
      return `${diffMins} menit yang lalu`;
    } else {
      return "baru saja";
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-neutral-light">
        <CardTitle className="font-nunito font-bold text-neutral-darkest">Status Integrasi Satu Sehat</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-neutral-dark">Sinkronisasi Data Pasien</div>
            <div className="px-2 py-1 rounded-full bg-status-success/10 text-status-success text-xs">Aktif</div>
          </div>
          <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-status-success" 
              style={{ width: `${data.dataSync.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-neutral-medium">{data.dataSync.percentage}% data tersinkronisasi</span>
            <span className="text-neutral-dark">{data.dataSync.synced}/{data.dataSync.total}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-neutral-dark">FHIR Resources</div>
            <div className="px-2 py-1 rounded-full bg-status-success/10 text-status-success text-xs">Aktif</div>
          </div>
          <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-status-success" 
              style={{ width: `${data.fhirResources.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-neutral-medium">
              {data.fhirResources.percentage === 100 ? "Semua resource tersedia" : `${data.fhirResources.percentage}% resource tersedia`}
            </span>
            <span className="text-neutral-dark">{data.fhirResources.available}/{data.fhirResources.total}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-neutral-dark">Koneksi API</div>
            <div className="px-2 py-1 rounded-full bg-status-success/10 text-status-success text-xs">Terhubung</div>
          </div>
          <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-status-success" 
              style={{ width: "100%" }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-neutral-medium">Response time: {data.connection.responseTime}</span>
            <span className="text-neutral-dark">Uptime {data.connection.uptime}</span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-neutral-dark">Validasi Data</div>
            <div className="px-2 py-1 rounded-full bg-status-warning/10 text-status-warning text-xs">Perlu Perhatian</div>
          </div>
          <div className="h-2 bg-neutral-light rounded-full overflow-hidden">
            <div 
              className="h-full bg-status-warning" 
              style={{ width: `${data.validation.percentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-neutral-medium">{data.validation.percentage}% tervalidasi</span>
            <span className="text-neutral-dark">{data.validation.validated}/{data.validation.total}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium text-neutral-dark">Terakhir Sinkronisasi</div>
            <div className="text-xs text-neutral-medium">{formatLastSync(data.lastSync)}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-md transition"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sedang Sinkronisasi...
              </>
            ) : (
              "Sinkronisasi Manual"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
