import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Invoice } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, ReceiptText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const BillingIndex: React.FC = () => {
  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });
  
  const unpaidInvoices = React.useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => invoice.status === "unpaid");
  }, [invoices]);
  
  const paidInvoices = React.useMemo(() => {
    if (!invoices) return [];
    return invoices.filter(invoice => invoice.status === "paid");
  }, [invoices]);
  
  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "No. Invoice",
    },
    {
      accessorKey: "patientId",
      header: "Pasien",
      cell: () => <div>Nama Pasien</div>, // Would need to join with patient data
    },
    {
      accessorKey: "invoiceDate",
      header: "Tanggal",
      cell: ({ row }) => {
        const date = new Date(row.getValue("invoiceDate"));
        return <div>{format(date, "dd/MM/yyyy")}</div>;
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const amount = row.getValue("total") as number;
        return <div>Rp {amount.toLocaleString('id-ID')}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        
        const getStatusClasses = (status: string) => {
          switch (status) {
            case "paid":
              return "bg-success bg-opacity-10 text-success";
            case "unpaid":
              return "bg-warning bg-opacity-10 text-warning";
            case "cancelled":
              return "bg-error bg-opacity-10 text-error";
            default:
              return "bg-neutral-200 text-neutral-500";
          }
        };
        
        const getStatusLabel = (status: string) => {
          switch (status) {
            case "paid": return "Lunas";
            case "unpaid": return "Belum Lunas";
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
      accessorKey: "paymentMethod",
      header: "Metode Pembayaran",
      cell: ({ row }) => <div>{row.getValue("paymentMethod") || "-"}</div>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const invoice = row.original;
        
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/billing/${invoice.id}`}>
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
        <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
        <Button asChild>
          <Link href="/billing/create-invoice">
            <a className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              <span>Buat Invoice</span>
            </a>
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="unpaid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="unpaid">Belum Lunas</TabsTrigger>
          <TabsTrigger value="paid">Lunas</TabsTrigger>
          <TabsTrigger value="all">Semua Invoice</TabsTrigger>
        </TabsList>
        
        <TabsContent value="unpaid" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Invoice Belum Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={unpaidInvoices} 
                  searchKey="invoiceNumber"
                  searchPlaceholder="Cari nomor invoice..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Invoice Lunas</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={paidInvoices} 
                  searchKey="invoiceNumber"
                  searchPlaceholder="Cari nomor invoice..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Semua Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={invoices || []} 
                  searchKey="invoiceNumber"
                  searchPlaceholder="Cari nomor invoice..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingIndex;
