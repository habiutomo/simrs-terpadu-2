import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Patient } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Plus, UserPlus } from "lucide-react";

const PatientsIndex: React.FC = () => {
  const { data: patients, isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "medicalRecordNumber",
      header: "No. Rekam Medis",
    },
    {
      accessorKey: "name",
      header: "Nama Pasien",
    },
    {
      accessorKey: "gender",
      header: "Jenis Kelamin",
      cell: ({ row }) => <div>{row.getValue("gender") === "male" ? "Laki-laki" : "Perempuan"}</div>,
    },
    {
      accessorKey: "birthDate",
      header: "Tanggal Lahir",
      cell: ({ row }) => {
        const date = new Date(row.getValue("birthDate"));
        return <div>{date.toLocaleDateString("id-ID")}</div>;
      },
    },
    {
      accessorKey: "phone",
      header: "Telepon",
      cell: ({ row }) => <div>{row.getValue("phone") || "-"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className={`px-2 py-1 rounded-full text-xs inline-block
            ${row.getValue("status") === "active" 
              ? "bg-success bg-opacity-10 text-success" 
              : "bg-error bg-opacity-10 text-error"
            }`}
        >
          {row.getValue("status") === "active" ? "Aktif" : "Tidak Aktif"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const patient = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/patients/${patient.id}`}>
                <a className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Lihat</span>
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
        <h1 className="text-2xl font-bold tracking-tight">Daftar Pasien</h1>
        <Button asChild>
          <Link href="/patients/register">
            <a className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Daftar Pasien Baru</span>
            </a>
          </Link>
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Memuat data...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={patients || []} 
            searchKey="name"
            searchPlaceholder="Cari nama pasien..."
          />
        )}
      </div>
    </div>
  );
};

export default PatientsIndex;
