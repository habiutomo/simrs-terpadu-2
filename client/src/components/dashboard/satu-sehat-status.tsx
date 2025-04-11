import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SATU_SEHAT_STATUS } from "@/lib/constants";
import { FolderSync } from "lucide-react";

interface SyncItemProps {
  label: string;
  value: number;
  status: string;
  color: "success" | "warning" | "error";
}

const SyncItem: React.FC<SyncItemProps> = ({ label, value, status, color }) => {
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
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-neutral-600">{label}</p>
        <span className={`${getTextColorClass(color)} text-sm`}>{status}</span>
      </div>
      <div className="w-full bg-neutral-200 rounded-full h-2">
        <div className={`${getColorClass(color)} rounded-full h-2`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
};

const SatuSehatStatus: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-600">Status Integrasi Satu Sehat</h3>
      </div>
      <div className="p-4">
        {SATU_SEHAT_STATUS.map((item, index) => (
          <SyncItem 
            key={index}
            label={item.label}
            value={item.value}
            status={item.status}
            color={item.color as "success" | "warning" | "error"}
          />
        ))}
        
        <div className="mt-6">
          <Button 
            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center justify-center"
          >
            <FolderSync className="h-4 w-4 mr-2" />
            <span>Sinkronisasi Semua Data</span>
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/satu-sehat">
            <a className="text-primary text-sm hover:underline">
              Lihat Detail Integrasi
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SatuSehatStatus;
