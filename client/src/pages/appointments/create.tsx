import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertAppointmentSchema } from "@shared/schema";
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
import { type Patient, type User } from "@shared/schema";

// Extend the insertAppointmentSchema with additional validation rules
const appointmentFormSchema = insertAppointmentSchema.extend({
  appointmentDate: z.string().min(1, "Tanggal janji harus diisi"),
  appointmentTime: z.string().min(1, "Waktu janji harus diisi"),
  patientId: z.number({
    required_error: "Pasien harus dipilih",
  }),
  doctorId: z.number({
    required_error: "Dokter harus dipilih",
  }),
  type: z.string().min(1, "Tipe janji harus dipilih"),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

const AppointmentCreate: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: patients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: doctors, isLoading: doctorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Filter doctors only (those with role "doctor")
  const doctorsList = doctors?.filter(user => user.role === "doctor") || [];
  
  // Set default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: 0,
      doctorId: 0,
      appointmentDate: format(new Date(), "yyyy-MM-dd"),
      appointmentTime: "09:00",
      type: "Konsultasi",
      status: "scheduled",
      notes: "",
      createdBy: 1, // Assuming current user ID
    },
  });
  
  const mutation = useMutation({
    mutationFn: (values: AppointmentFormValues) => 
      apiRequest("POST", "/api/appointments", values),
    onSuccess: async () => {
      toast({
        title: "Janji dokter berhasil dibuat",
        description: "Jadwal janji dokter baru telah disimpan",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      navigate("/appointments");
    },
    onError: (error) => {
      toast({
        title: "Gagal membuat janji dokter",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: AppointmentFormValues) => {
    mutation.mutate(values);
  };
  
  if (patientsLoading || doctorsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Memuat data...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Janji Dokter</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Detail Janji Dokter</CardTitle>
            <CardDescription>
              Masukkan informasi untuk membuat janji dokter baru.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientId">Pasien</Label>
                <Select 
                  onValueChange={(value) => form.setValue("patientId", parseInt(value))}
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
                <Label htmlFor="appointmentDate">Tanggal Janji</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  {...form.register("appointmentDate")}
                />
                {form.formState.errors.appointmentDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.appointmentDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Waktu Janji</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  {...form.register("appointmentTime")}
                />
                {form.formState.errors.appointmentTime && (
                  <p className="text-sm text-red-500">{form.formState.errors.appointmentTime.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Kunjungan</Label>
                <Select 
                  onValueChange={(value) => form.setValue("type", value)}
                  defaultValue={form.getValues("type")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe kunjungan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Konsultasi">Konsultasi</SelectItem>
                    <SelectItem value="Pemeriksaan">Pemeriksaan</SelectItem>
                    <SelectItem value="Kontrol">Kontrol</SelectItem>
                    <SelectItem value="Tindakan">Tindakan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  onValueChange={(value) => form.setValue("status", value)}
                  defaultValue={form.getValues("status")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Terjadwal</SelectItem>
                    <SelectItem value="waiting">Menunggu</SelectItem>
                    <SelectItem value="in-progress">Hadir</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Masukkan catatan (opsional)"
                rows={3}
                {...form.register("notes")}
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate("/appointments")}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan Janji Dokter"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default AppointmentCreate;
