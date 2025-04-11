import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMedicalRecordSchema } from "@shared/schema";
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
import { type Patient, type User, type Appointment } from "@shared/schema";

// Extend the insertMedicalRecordSchema with additional validation rules
const medicalRecordFormSchema = insertMedicalRecordSchema.extend({
  recordDate: z.string().min(1, "Tanggal rekam medis harus diisi"),
  patientId: z.number({
    required_error: "Pasien harus dipilih",
  }),
  doctorId: z.number({
    required_error: "Dokter harus dipilih",
  }),
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    heartRate: z.string().optional(),
    respiratoryRate: z.string().optional(),
    temperature: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordFormSchema>;

const MedicalRecordCreate: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: doctors, isLoading: doctorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  const [selectedPatient, setSelectedPatient] = React.useState<number | null>(null);
  
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", { patientId: selectedPatient }],
    enabled: !!selectedPatient,
  });
  
  // Filter doctors only (those with role "doctor")
  const doctorsList = doctors?.filter(user => user.role === "doctor") || [];
  
  // Set default values
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      recordDate: format(new Date(), "yyyy-MM-dd"),
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      icd10Code: "",
      vitalSigns: {
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        temperature: "",
        height: "",
        weight: "",
      },
      createdBy: 1, // Assuming current user ID
    },
  });
  
  const mutation = useMutation({
    mutationFn: (values: MedicalRecordFormValues) => 
      apiRequest("POST", "/api/medical-records", values),
    onSuccess: async () => {
      toast({
        title: "Rekam medis berhasil dibuat",
        description: "Data rekam medis baru telah disimpan",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/medical-records"] });
      navigate("/medical-records");
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat rekam medis",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: MedicalRecordFormValues) => {
    // Ensure vitalSigns is in JSON format
    if (typeof values.vitalSigns === 'object') {
      values.vitalSigns = values.vitalSigns as any;
    }
    
    mutation.mutate(values);
  };
  
  React.useEffect(() => {
    if (selectedPatient) {
      form.setValue("patientId", selectedPatient);
    }
  }, [selectedPatient, form]);
  
  if (patientsLoading || doctorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Rekam Medis</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Masukkan informasi dasar rekam medis.
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
                  <Label htmlFor="recordDate">Tanggal Rekam Medis</Label>
                  <Input
                    id="recordDate"
                    type="date"
                    {...form.register("recordDate")}
                  />
                  {form.formState.errors.recordDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.recordDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointmentId">Kunjungan Terkait</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("appointmentId", parseInt(value))}
                    defaultValue={form.getValues("appointmentId")?.toString()}
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tanda Vital</CardTitle>
              <CardDescription>
                Masukkan tanda vital pasien.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Tekanan Darah (mmHg)</Label>
                  <Input
                    id="bloodPressure"
                    placeholder="120/80"
                    {...form.register("vitalSigns.bloodPressure")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Detak Jantung (bpm)</Label>
                  <Input
                    id="heartRate"
                    placeholder="80"
                    {...form.register("vitalSigns.heartRate")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="respiratoryRate">Laju Pernafasan (/menit)</Label>
                  <Input
                    id="respiratoryRate"
                    placeholder="20"
                    {...form.register("vitalSigns.respiratoryRate")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="temperature">Suhu (°C)</Label>
                  <Input
                    id="temperature"
                    placeholder="36.5"
                    {...form.register("vitalSigns.temperature")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Tinggi (cm)</Label>
                  <Input
                    id="height"
                    placeholder="170"
                    {...form.register("vitalSigns.height")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Berat (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="65"
                    {...form.register("vitalSigns.weight")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Data SOAP</CardTitle>
              <CardDescription>
                Masukkan data SOAP (Subjective, Objective, Assessment, Plan).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subjective">S - Subjective (Keluhan Pasien)</Label>
                <Textarea
                  id="subjective"
                  placeholder="Masukkan keluhan pasien"
                  rows={3}
                  {...form.register("subjective")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">O - Objective (Hasil Pemeriksaan Fisik)</Label>
                <Textarea
                  id="objective"
                  placeholder="Masukkan hasil pemeriksaan fisik"
                  rows={3}
                  {...form.register("objective")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assessment">A - Assessment (Diagnosis)</Label>
                <Textarea
                  id="assessment"
                  placeholder="Masukkan diagnosis"
                  rows={3}
                  {...form.register("assessment")}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="icd10Code">Kode ICD-10</Label>
                  <Input
                    id="icd10Code"
                    placeholder="Contoh: J06.9"
                    {...form.register("icd10Code")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan">P - Plan (Rencana Pengobatan)</Label>
                <Textarea
                  id="plan"
                  placeholder="Masukkan rencana pengobatan"
                  rows={3}
                  {...form.register("plan")}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate("/medical-records")}>
                Batal
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Simpan Rekam Medis"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default MedicalRecordCreate;
