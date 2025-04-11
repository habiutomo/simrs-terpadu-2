import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Medication, type Prescription } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, FileUp, Pill, Plus, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const PharmacyIndex: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });
  
  const { data: prescriptions, isLoading: prescriptionsLoading } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions", { date: new Date().toISOString().split('T')[0] }],
  });
  
  const filteredMedications = React.useMemo(() => {
    if (!medications) return [];
    if (!searchTerm) return medications;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return medications.filter(
      med => med.name.toLowerCase().includes(lowerSearchTerm) || 
             med.code.toLowerCase().includes(lowerSearchTerm)
    );
  }, [medications, searchTerm]);
  
  const medicationColumns: ColumnDef<Medication>[] = [
    {
      accessorKey: "code",
      header: "Kode",
    },
    {
      accessorKey: "name",
      header: "Nama Obat",
    },
    {
      accessorKey: "type",
      header: "Tipe",
    },
    {
      accessorKey: "unit",
      header: "Satuan",
    },
    {
      accessorKey: "price",
      header: "Harga",
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return <div>Rp {price.toLocaleString('id-ID')}</div>;
      },
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ row }) => {
        const stock = row.getValue("stock") as number;
        const stockClass = stock <= 10 ? "text-error" : stock <= 30 ? "text-warning" : "text-success";
        return <div className={stockClass}>{stock}</div>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const medication = row.original;
        
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/pharmacy/medications/${medication.id}`}>
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
  
  const prescriptionColumns: ColumnDef<Prescription>[] = [
    {
      accessorKey: "prescriptionDate",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("prescriptionDate"));
        return <div>{date.toLocaleDateString('id-ID')}</div>;
      },
    },
    {
      accessorKey: "patientId",
      header: "Pasien",
      cell: () => <div>Nama Pasien</div>, // Would need to join with patient data
    },
    {
      accessorKey: "doctorId",
      header: "Dokter",
      cell: () => <div>Nama Dokter</div>, // Would need to join with doctor data
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        const getStatusClasses = (status: string) => {
          switch (status) {
            case "completed":
              return "bg-success bg-opacity-10 text-success";
            case "processed":
              return "bg-success bg-opacity-10 text-success";
            case "pending":
              return "bg-warning bg-opacity-10 text-warning";
            case "cancelled":
              return "bg-error bg-opacity-10 text-error";
            default:
              return "bg-neutral-200 text-neutral-500";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status) {
            case "completed": return "Selesai";
            case "processed": return "Diproses";
            case "pending": return "Menunggu";
            case "cancelled": return "Dibatalkan";
            default: return status;
          }
        };
        
        return (
          <div className={`px-2 py-1 rounded-full text-xs inline-block ${getStatusClasses(status)}`}>
            {getStatusLabel(status)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const prescription = row.original;
        
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/pharmacy/prescriptions/${prescription.id}`}>
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
        <h1 className="text-2xl font-bold tracking-tight">Farmasi</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/pharmacy/manage-inventory">
              <a className="flex items-center gap-2">
                <FileUp className="h-4 w-4" />
                <span>Penyesuaian Stok</span>
              </a>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/pharmacy/create-order">
              <a className="flex items-center gap-2">
                <Pill className="h-4 w-4" />
                <span>Order Farmasi</span>
              </a>
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="medications" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="medications">Daftar Obat</TabsTrigger>
          <TabsTrigger value="prescriptions">Resep Obat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Daftar Obat</CardTitle>
                
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari obat..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button asChild>
                    <Link href="/pharmacy/medications/add">
                      <a>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Obat
                      </a>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {medicationsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <DataTable 
                  columns={medicationColumns} 
                  data={filteredMedications} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="prescriptions">
          <Card>
            <CardHeader>
              <CardTitle>Resep Obat Hari Ini</CardTitle>
            </CardHeader>
            <CardContent>
              {prescriptionsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : prescriptions && prescriptions.length > 0 ? (
                <DataTable 
                  columns={prescriptionColumns} 
                  data={prescriptions} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Pill className="h-16 w-16 text-neutral-300" />
                  <p className="text-neutral-500">Belum ada resep obat hari ini</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PharmacyIndex;
