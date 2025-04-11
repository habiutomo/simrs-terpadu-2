import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPatientSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Extend the insertPatientSchema with additional validation rules
const patientFormSchema = insertPatientSchema.extend({
  birthDate: z.string().min(1, "Tanggal lahir harus diisi"),
  gender: z.enum(["male", "female"], {
    required_error: "Jenis kelamin harus dipilih",
  }),
  createdBy: z.number().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

const PatientRegister: React.FC = () => {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  
  // Set default values
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      medicalRecordNumber: "",
      name: "",
      gender: "male",
      birthDate: format(new Date(), "yyyy-MM-dd"),
      address: "",
      phone: "",
      email: "",
      idNumber: "",
      bloodType: "",
      insuranceNumber: "",
      insuranceProvider: "",
      status: "active",
      createdBy: 1, // Assuming current user ID
    },
  });
  
  const mutation = useMutation({
    mutationFn: (values: PatientFormValues) => 
      apiRequest("POST", "/api/patients", values),
    onSuccess: async () => {
      toast({
        title: "Pasien berhasil didaftarkan",
        description: "Data pasien baru telah disimpan",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      navigate("/patients");
    },
    onError: (error) => {
      toast({
        title: "Gagal mendaftarkan pasien",
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: PatientFormValues) => {
    mutation.mutate(values);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Daftar Pasien Baru</h1>
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Data Pasien</CardTitle>
            <CardDescription>
              Masukkan informasi pasien baru. Pastikan semua data yang dimasukkan benar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="medicalRecordNumber">Nomor Rekam Medis</Label>
                <Input
                  id="medicalRecordNumber"
                  placeholder="Contoh: RM-2023-001"
                  {...form.register("medicalRecordNumber")}
                />
                {form.formState.errors.medicalRecordNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.medicalRecordNumber.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Masukkan nama lengkap"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <RadioGroup
                  defaultValue={form.getValues("gender")}
                  onValueChange={(value) => form.setValue("gender", value as "male" | "female")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">Laki-laki</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">Perempuan</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-500">{form.formState.errors.gender.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthDate">Tanggal Lahir</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...form.register("birthDate")}
                />
                {form.formState.errors.birthDate && (
                  <p className="text-sm text-red-500">{form.formState.errors.birthDate.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="idNumber">Nomor KTP</Label>
                <Input
                  id="idNumber"
                  placeholder="Masukkan nomor KTP"
                  {...form.register("idNumber")}
                />
                {form.formState.errors.idNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.idNumber.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bloodType">Golongan Darah</Label>
                <Select 
                  onValueChange={(value) => form.setValue("bloodType", value)}
                  defaultValue={form.getValues("bloodType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih golongan darah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="O">O</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.bloodType && (
                  <p className="text-sm text-red-500">{form.formState.errors.bloodType.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  placeholder="Contoh: 081234567890"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Contoh: pasien@email.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                placeholder="Masukkan alamat lengkap"
                rows={3}
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Nomor Asuransi</Label>
                <Input
                  id="insuranceNumber"
                  placeholder="Masukkan nomor asuransi"
                  {...form.register("insuranceNumber")}
                />
                {form.formState.errors.insuranceNumber && (
                  <p className="text-sm text-red-500">{form.formState.errors.insuranceNumber.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Provider Asuransi</Label>
                <Input
                  id="insuranceProvider"
                  placeholder="Contoh: BPJS Kesehatan"
                  {...form.register("insuranceProvider")}
                />
                {form.formState.errors.insuranceProvider && (
                  <p className="text-sm text-red-500">{form.formState.errors.insuranceProvider.message}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => navigate("/patients")}>
              Batal
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Simpan Data Pasien"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default PatientRegister;
