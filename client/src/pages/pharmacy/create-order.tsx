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
import { type Medication, type Patient, type MedicalRecord, type User } from "@shared/schema";
import { Trash2 } from "lucide-react";

// Schema for prescription form
const prescriptionFormSchema = z.object({
  patientId: z.number({
    required_error: "Pasien harus dipilih",
  }),
  doctorId: z.number({
    required_error: "Dokter harus dipilih",
  }),
  medicalRecordId: z.number({
    required_error: "Rekam medis harus dipilih",
  }),
  prescriptionDate: z.string().min(1, "Tanggal resep harus diisi"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      medicationId: z.number({
        required_error: "Obat harus dipilih",
      }),
      quantity: z.number({
        required_error: "Jumlah harus diisi",
      }).min(1, "Jumlah minimal 1"),
      dosage: z.string().min(1, "Dosis harus diisi"),
      instructions: z.string().min(1, "Instruksi harus diisi"),
    })
  ).min(1, "Minimal harus ada 1 item obat"),
  createdBy: z.number().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

const PharmacyCreateOrder: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: doctors, isLoading: doctorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const { data: medications, isLoading: medicationsLoading } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });
  
  const [selectedPatient, setSelectedPatient] = React.useState<number | null>(null);
  
  const { data: medicalRecords, isLoading: recordsLoading } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records", { patientId: selectedPatient }],
    enabled: !!selectedPatient,
  });
  
  // Set default values
  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      medicalRecordId: 0,
      prescriptionDate: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      items: [
        {
          medicationId: 0,
          quantity: 1,
          dosage: "",
          instructions: "",
        },
      ],
      createdBy: 1, // Assuming current user ID
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const prescription = useMutation({
    mutationFn: async (values: PrescriptionFormValues) => {
      // First create the prescription
      const prescriptionResponse = await apiRequest("POST", "/api/prescriptions", {
        patientId: values.patientId,
        doctorId: values.doctorId,
        medicalRecordId: values.medicalRecordId,
        prescriptionDate: values.prescriptionDate,
        notes: values.notes,
        status: "pending",
        createdBy: values.createdBy,
      });
      
      const prescriptionData = await prescriptionResponse.json();
      
      // Then create prescription items
      for (const item of values.items) {
        await apiRequest("POST", "/api/prescription-items", {
          prescriptionId: prescriptionData.id,
          medicationId: item.medicationId,
          quantity: item.quantity,
          dosage: item.dosage,
          instructions: item.instructions,
        });
      }
      
      return prescriptionData;
    },
    onSuccess: async () => {
      toast({
        title: "Resep obat berhasil dibuat",
        description: "Data resep obat baru telah disimpan",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      navigate("/pharmacy");
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat resep obat",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: PrescriptionFormValues) => {
    prescription.mutate(values);
  };
  
  React.useEffect(() => {
    if (selectedPatient) {
      form.setValue("patientId", selectedPatient);
    }
  }, [selectedPatient, form]);
  
  if (patientsLoading || doctorsLoading || medicationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  // Filter doctors only (those with role "doctor")
  const doctorsList = doctors?.filter(user => user.role === "doctor") || [];
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Order Farmasi</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Resep</CardTitle>
              <CardDescription>
                Masukkan informasi pasien dan dokter untuk resep.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="doctorId">Dokter</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("doctorId", parseInt(value))}
                    defaultValue={form.getValues("doctorId").toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih dokter" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsList.map(doctor => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.doctorId && (
                    <p className="text-sm text-red-500">{form.formState.errors.doctorId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="medicalRecordId">Rekam Medis</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("medicalRecordId", parseInt(value))}
                    defaultValue={form.getValues("medicalRecordId").toString()}
                    disabled={!selectedPatient || recordsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={recordsLoading ? "Memuat..." : "Pilih rekam medis"} />
                    </SelectTrigger>
                    <SelectContent>
                      {medicalRecords?.map(record => (
                        <SelectItem key={record.id} value={record.id.toString()}>
                          {format(new Date(record.recordDate), "dd/MM/yyyy")} - {record.assessment || "Rekam medis"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.medicalRecordId && (
                    <p className="text-sm text-red-500">{form.formState.errors.medicalRecordId.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="prescriptionDate">Tanggal Resep</Label>
                  <Input
                    id="prescriptionDate"
                    type="date"
                    {...form.register("prescriptionDate")}
                  />
                  {form.formState.errors.prescriptionDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.prescriptionDate.message}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  placeholder="Catatan tambahan untuk resep (opsional)"
                  rows={2}
                  {...form.register("notes")}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Item Obat</CardTitle>
                  <CardDescription>
                    Tambahkan obat-obat yang diresepkan.
                  </CardDescription>
                </div>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => append({ medicationId: 0, quantity: 1, dosage: "", instructions: "" })}
                >
                  Tambah Obat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Obat #{index + 1}</h4>
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
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.medicationId`}>Obat</Label>
                      <Select 
                        onValueChange={(value) => form.setValue(`items.${index}.medicationId`, parseInt(value))}
                        defaultValue={form.getValues(`items.${index}.medicationId`).toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih obat" />
                        </SelectTrigger>
                        <SelectContent>
                          {medications?.map(medication => (
                            <SelectItem key={medication.id} value={medication.id.toString()}>
                              {medication.name} ({medication.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.items?.[index]?.medicationId && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.medicationId?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.quantity`}>Jumlah</Label>
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.quantity?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.dosage`}>Dosis</Label>
                      <Input
                        id={`items.${index}.dosage`}
                        placeholder="Contoh: 3x1 tablet"
                        {...form.register(`items.${index}.dosage`)}
                      />
                      {form.formState.errors.items?.[index]?.dosage && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.dosage?.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.instructions`}>Instruksi</Label>
                      <Input
                        id={`items.${index}.instructions`}
                        placeholder="Contoh: Diminum setelah makan"
                        {...form.register(`items.${index}.instructions`)}
                      />
                      {form.formState.errors.items?.[index]?.instructions && (
                        <p className="text-sm text-red-500">{form.formState.errors.items?.[index]?.instructions?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {form.formState.errors.items && !Array.isArray(form.formState.errors.items) && (
                <p className="text-sm text-red-500">{form.formState.errors.items.message}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/pharmacy")}>
                Batal
              </Button>
              <Button type="submit" disabled={prescription.isPending}>
                {prescription.isPending ? "Menyimpan..." : "Simpan Resep Obat"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default PharmacyCreateOrder;
