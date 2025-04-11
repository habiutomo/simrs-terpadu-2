import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { type Patient, type Appointment, type Prescription } from "@shared/schema";
import { Trash2 } from "lucide-react";

// Schema for invoice form
const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Nomor invoice harus diisi"),
  patientId: z.number({
    required_error: "Pasien harus dipilih",
  }),
  appointmentId: z.number().optional(),
  prescriptionId: z.number().optional(),
  invoiceDate: z.string().min(1, "Tanggal invoice harus diisi"),
  dueDate: z.string().optional(),
  subtotal: z.number({
    required_error: "Subtotal harus diisi",
  }).min(0, "Subtotal tidak boleh negatif"),
  discount: z.number().default(0),
  tax: z.number().default(0),
  total: z.number({
    required_error: "Total harus diisi",
  }).min(0, "Total tidak boleh negatif"),
  status: z.string().default("unpaid"),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "Deskripsi harus diisi"),
      quantity: z.number({
        required_error: "Jumlah harus diisi",
      }).min(1, "Jumlah minimal 1"),
      unitPrice: z.number({
        required_error: "Harga satuan harus diisi",
      }).min(0, "Harga satuan tidak boleh negatif"),
      amount: z.number({
        required_error: "Jumlah harus diisi",
      }).min(0, "Jumlah tidak boleh negatif"),
      itemType: z.string().min(1, "Tipe item harus dipilih"),
      itemId: z.number().optional(),
    })
  ).min(1, "Minimal harus ada 1 item invoice"),
  createdBy: z.number().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const BillingCreateInvoice: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const [selectedPatient, setSelectedPatient] = React.useState<number | null>(null);
  
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", { patientId: selectedPatient }],
    enabled: !!selectedPatient,
  });
  
  const { data: prescriptions } = useQuery<Prescription[]>({
    queryKey: ["/api/prescriptions", { patientId: selectedPatient }],
    enabled: !!selectedPatient,
  });
  
  // Generate a random invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV/${year}${month}${day}/${random}`;
  };
  
  // Set default values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: generateInvoiceNumber(),
      patientId: 0,
      appointmentId: undefined,
      prescriptionId: undefined,
      invoiceDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(new Date().setDate(new Date().getDate() + 7)), "yyyy-MM-dd"),
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      status: "unpaid",
      paymentMethod: "",
      notes: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          amount: 0,
          itemType: "service",
          itemId: undefined,
        },
      ],
      createdBy: 1, // Assuming current user ID
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  // Calculate subtotal, total when items change
  React.useEffect(() => {
    const items = form.getValues("items");
    const subtotal = items.reduce((acc, item) => acc + (item.amount || 0), 0);
    const discount = form.getValues("discount") || 0;
    const tax = form.getValues("tax") || 0;
    const total = subtotal - discount + tax;
    
    form.setValue("subtotal", subtotal);
    form.setValue("total", total);
  }, [form.watch("items"), form.watch("discount"), form.watch("tax")]);
  
  // Update amount when quantity or unitPrice changes
  const updateAmount = (index: number) => {
    const quantity = form.getValues(`items.${index}.quantity`) || 0;
    const unitPrice = form.getValues(`items.${index}.unitPrice`) || 0;
    const amount = quantity * unitPrice;
    form.setValue(`items.${index}.amount`, amount);
  };
  
  const invoice = useMutation({
    mutationFn: async (values: InvoiceFormValues) => {
      // First create the invoice
      const invoiceResponse = await apiRequest("POST", "/api/invoices", {
        invoiceNumber: values.invoiceNumber,
        patientId: values.patientId,
        appointmentId: values.appointmentId || null,
        prescriptionId: values.prescriptionId || null,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate || null,
        subtotal: values.subtotal,
        discount: values.discount,
        tax: values.tax,
        total: values.total,
        status: values.status,
        paymentMethod: values.paymentMethod || null,
        paymentDate: null,
        notes: values.notes || null,
        createdBy: values.createdBy,
      });
      
      const invoiceData = await invoiceResponse.json();
      
      // Then create invoice items
      for (const item of values.items) {
        await apiRequest("POST", "/api/invoice-items", {
          invoiceId: invoiceData.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          itemType: item.itemType,
          itemId: item.itemId || null,
        });
      }
      
      return invoiceData;
    },
    onSuccess: async () => {
      toast({
        title: "Invoice berhasil dibuat",
        description: "Data invoice baru telah disimpan",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      navigate("/billing");
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat invoice",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: InvoiceFormValues) => {
    invoice.mutate(values);
  };
  
  React.useEffect(() => {
    if (selectedPatient) {
      form.setValue("patientId", selectedPatient);
    }
  }, [selectedPatient, form]);
  
  if (patientsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Invoice</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Invoice</CardTitle>
              <CardDescription>
                Masukkan informasi dasar invoice.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Nomor Invoice</Label>
                  <Input
                    id="invoiceNumber"
                    {...form.register("invoiceNumber")}
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.invoiceNumber.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="patientId">Pasien</Label>
                  <Select 
                    onValueChange={(value) => {
                      const patientId = parseInt(value);
                      setSelectedPatient(patientId);
                      form.setValue("patientId", patientId);
                    }}
                    defaultValue={form.getValues("patientId").toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih pasien" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients?.map(patient => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name} ({patient.medicalRecordNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.patientId && (
                    <p className="text-sm text-red-500">{form.formState.errors.patientId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointmentId">Kunjungan Terkait</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("appointmentId", parseInt(value))}
                    defaultValue={form.getValues("appointmentId")?.toString()}
                    disabled={!selectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kunjungan (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tidak ada</SelectItem>
                      {appointments?.map(appointment => (
                        <SelectItem key={appointment.id} value={appointment.id.toString()}>
                          {format(new Date(appointment.appointmentDate), "dd/MM/yyyy")} - {appointment.appointmentTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prescriptionId">Resep Terkait</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("prescriptionId", parseInt(value))}
                    defaultValue={form.getValues("prescriptionId")?.toString()}
                    disabled={!selectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih resep (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tidak ada</SelectItem>
                      {prescriptions?.map(prescription => (
                        <SelectItem key={prescription.id} value={prescription.id.toString()}>
                          {format(new Date(prescription.prescriptionDate), "dd/MM/yyyy")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Tanggal Invoice</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...form.register("invoiceDate")}
                  />
                  {form.formState.errors.invoiceDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.invoiceDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Tanggal Jatuh Tempo</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Item Invoice</CardTitle>
                  <CardDescription>
                    Tambahkan item-item yang akan ditagih.
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => append({ 
                    description: "", 
                    quantity: 1, 
                    unitPrice: 0, 
                    amount: 0, 
                    itemType: "service", 
                    itemId: undefined 
                  })}
                >
                  Tambah Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Item #{index + 1}</h4>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-error" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`items.${index}.description`}>Deskripsi</Label>
                      <Input
                        id={`items.${index}.description`}
                        placeholder="Deskripsi item"
                        {...form.register(`items.${index}.description`)}
                      />
                      {form.formState.errors.items?.[index]?.description && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.description?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.itemType`}>Tipe Item</Label>
                      <Select 
                        onValueChange={(value) => form.setValue(`items.${index}.itemType`, value)}
                        defaultValue={form.getValues(`items.${index}.itemType`)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe item" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consultation">Konsultasi</SelectItem>
                          <SelectItem value="medication">Obat</SelectItem>
                          <SelectItem value="procedure">Tindakan</SelectItem>
                          <SelectItem value="service">Layanan</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.items?.[index]?.itemType && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.itemType?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.quantity`}>Jumlah</Label>
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        step="1"
                        {...form.register(`items.${index}.quantity`, { 
                          valueAsNumber: true,
                          onChange: () => updateAmount(index)
                        })}
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.quantity?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.unitPrice`}>Harga Satuan</Label>
                      <Input
                        id={`items.${index}.unitPrice`}
                        type="number"
                        min="0"
                        step="1000"
                        {...form.register(`items.${index}.unitPrice`, { 
                          valueAsNumber: true,
                          onChange: () => updateAmount(index)
                        })}
                      />
                      {form.formState.errors.items?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.unitPrice?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.amount`}>Total</Label>
                      <Input
                        id={`items.${index}.amount`}
                        type="number"
                        readOnly
                        {...form.register(`items.${index}.amount`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.items?.[index]?.amount && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.amount?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {form.formState.errors.items && !Array.isArray(form.formState.errors.items) && (
                <p className="text-sm text-red-500">{form.formState.errors.items.message}</p>
              )}
              
              <div className="pt-4 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="subtotal">Subtotal</Label>
                  <div className="flex gap-2 items-center">
                    <span>Rp</span>
                    <Input
                      id="subtotal"
                      type="number"
                      className="w-48 text-right"
                      readOnly
                      {...form.register("subtotal", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="discount">Diskon</Label>
                  <div className="flex gap-2 items-center">
                    <span>Rp</span>
                    <Input
                      id="discount"
                      type="number"
                      className="w-48 text-right"
                      {...form.register("discount", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Label htmlFor="tax">Pajak</Label>
                  <div className="flex gap-2 items-center">
                    <span>Rp</span>
                    <Input
                      id="tax"
                      type="number"
                      className="w-48 text-right"
                      {...form.register("tax", { valueAsNumber: true })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <Label htmlFor="total" className="text-lg font-bold">Total</Label>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold">Rp</span>
                    <Input
                      id="total"
                      type="number"
                      className="w-48 text-right font-bold"
                      readOnly
                      {...form.register("total", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="space-y-2 w-full max-w-xs">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan untuk invoice (opsional)"
                  rows={2}
                  {...form.register("notes")}
                />
              </div>
              
              <div className="flex gap-2 items-center">
                <Button variant="outline" type="button" onClick={() => navigate("/billing")}>
                  Batal
                </Button>
                <Button type="submit" disabled={invoice.isPending}>
                  {invoice.isPending ? "Menyimpan..." : "Simpan Invoice"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default BillingCreateInvoice;
