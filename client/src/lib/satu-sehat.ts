import { apiRequest } from "./queryClient";

export interface SatuSehatStatus {
  status: "terhubung" | "terputus";
  dataSync: {
    total: number;
    synced: number;
    percentage: number;
  };
  fhirResources: {
    total: number;
    available: number;
    percentage: number;
  };
  connection: {
    status: "terhubung" | "terputus";
    responseTime: string;
    uptime: string;
  };
  validation: {
    total: number;
    validated: number;
    percentage: number;
  };
  lastSync: Date;
}

export interface SyncResult {
  success: boolean;
  message: string;
  syncTime: Date;
}

export async function getSatuSehatStatus(): Promise<SatuSehatStatus> {
  const response = await apiRequest("GET", "/api/satu-sehat/status");
  const data = await response.json();
  return {
    ...data,
    lastSync: new Date(data.lastSync)
  };
}

export async function performSync(): Promise<SyncResult> {
  const response = await apiRequest("POST", "/api/satu-sehat/sync");
  const data = await response.json();
  return {
    ...data,
    syncTime: new Date(data.syncTime)
  };
}
