import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type MedicalRecord, type Patient, type User } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileText, UserSearch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface MedicalRecordWithNames extends MedicalRecord {
  patientName?: string;
  doctorName?: string;
}

const MedicalRecordsIndex: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);
  
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: doctors } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: medicalRecords, isLoading } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records", { patientId: selectedPatient }],
    enabled: !!selectedPatient,
  });
  
  // Combine medical record data with patient and doctor names
  const recordsWithNames: MedicalRecordWithNames[] = React.useMemo(() => {
    if (!medicalRecords || !patients || !doctors) return [];
    
    return medicalRecords.map(record => {
      const patient = patients.find(p => p.id === record.patientId);
      const doctor = doctors.find(d => d.id === record.doctorId);
      
      return {
        ...record,
        patientName: patient?.name,
        doctorName: doctor?.name
      };
    });
  }, [medicalRecords, patients, doctors]);
  
  const columns: ColumnDef<MedicalRecordWithNames>[] = [
    {
      accessorKey: "recordDate",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("recordDate"));
        return <div>{date.toLocaleDateString("id-ID")}</div>;
      },
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
    },
    {
      accessorKey: "doctorName",
      header: "Dokter",
    },
    {
      accessorKey: "assessment",
      header: "Diagnosis",
      cell: ({ row }) => {
        const assessment = row.getValue("assessment") as string;
        const shortAssessment = assessment && assessment.length > 50 
          ? `${assessment.substring(0, 50)}...` 
          : assessment;
        return <div>{shortAssessment || "-"}</div>;
      },
    },
    {
      accessorKey: "icd10Code",
      header: "Kode ICD-10",
      cell: ({ row }) => <div>{row.getValue("icd10Code") || "-"}</div>,
    },
    {
      accessorKey: "satuSehatSynced",
      header: "Satu Sehat",
      cell: ({ row }) => {
        const synced = row.getValue("satuSehatSynced") as boolean;
        return (
          <div className={`px-2 py-1 rounded-full text-xs inline-block
              ${synced 
                ? "bg-success bg-opacity-10 text-success" 
                : "bg-warning bg-opacity-10 text-warning"
              }`}
          >
            {synced ? "Tersinkron" : "Belum Sinkron"}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const record = row.original;
        
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/medical-records/${record.id}`}>
                <a className="flex items-center text-primary">
                  <Eye className="h-4 w-4" />
                </a>
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Rekam Medis</h1>
        <Button asChild>
          <Link href="/medical-records/create">
            <a className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Buat Rekam Medis</span>
            </a>
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Cari Rekam Medis Pasien</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patientId">Pilih Pasien</Label>
              <Select 
                onValueChange={(value) => setSelectedPatient(parseInt(value))}
                value={selectedPatient?.toString() || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih pasien untuk melihat rekam medis" />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map(patient => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.name} ({patient.medicalRecordNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setSelectedPatient(null)}
                disabled={!selectedPatient}
                className="w-full"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {selectedPatient ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Rekam Medis: {patients?.find(p => p.id === selectedPatient)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>Memuat data...</p>
              </div>
            ) : recordsWithNames.length > 0 ? (
              <DataTable 
                columns={columns} 
                data={recordsWithNames} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <UserSearch className="h-16 w-16 text-neutral-300" />
                <p className="text-neutral-500">Belum ada data rekam medis untuk pasien ini</p>
                <Button asChild>
                  <Link href="/medical-records/create">
                    <a>Buat Rekam Medis</a>
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-white rounded-lg shadow p-6">
          <UserSearch className="h-16 w-16 text-neutral-300" />
          <p className="text-neutral-500">Pilih pasien untuk melihat rekam medis</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsIndex;
