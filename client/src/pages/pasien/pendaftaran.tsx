import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import Header from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import { insertPasienSchema, InsertPasien } from "@shared/schema";

const pendaftaranSchema = insertPasienSchema.extend({
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi")
});

type PendaftaranFormValues = z.infer<typeof pendaftaranSchema>;

export default function PendaftaranPasien() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<PendaftaranFormValues>({
    resolver: zodResolver(pendaftaranSchema),
    defaultValues: {
      nama: "",
      nik: "",
      jenisKelamin: "L",
      alamat: "",
      telepon: "",
      email: "",
      golonganDarah: "",
      alergi: "",
      catatanKhusus: "",
    },
  });

  const pendaftaranMutation = useMutation({
    mutationFn: async (values: PendaftaranFormValues) => {
      // Convert string date to Date object
      const data: InsertPasien = {
        ...values,
        tanggalLahir: new Date(values.tanggalLahir),
      };
      
      const response = await apiRequest("POST", "/api/pasien", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Pendaftaran Berhasil",
        description: "Data pasien berhasil disimpan",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/pasien'] });
      navigate("/pasien");
    },
    onError: (error: Error) => {
      toast({
        title: "Pendaftaran Gagal",
        description: error.message || "Terjadi kesalahan saat menyimpan data",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: PendaftaranFormValues) {
    pendaftaranMutation.mutate(data);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-lightest">
      <Sidebar />

      <div className="flex-1 md:ml-64 pt-5 pb-20 md:pb-5 overflow-y-auto">
        <Header
          title="Pendaftaran Pasien Baru"
          subtitle="Isi data pasien dengan lengkap dan benar"
          backButton={true}
          backButtonLink="/pasien"
        />

        <div className="px-4 md:px-6 pb-8">
          <Card>
            <CardHeader>
              <CardTitle>Form Pendaftaran Pasien</CardTitle>
              <CardDescription>
                Data pasien akan disimpan dan digunakan untuk keperluan administrasi dan pelayanan kesehatan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nama"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Lengkap <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama lengkap" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nik"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIK <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan NIK" {...field} />
                          </FormControl>
                          <FormDescription>
                            16 digit Nomor Induk Kependudukan
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jenisKelamin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="L">Laki-laki</SelectItem>
                              <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="tanggalLahir"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tanggal Lahir <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telepon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nomor Telepon</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nomor telepon" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="golonganDarah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Golongan Darah</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih golongan darah" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="AB">AB</SelectItem>
                              <SelectItem value="O">O</SelectItem>
                              <SelectItem value="A+">A+</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="AB+">AB+</SelectItem>
                              <SelectItem value="AB-">AB-</SelectItem>
                              <SelectItem value="O+">O+</SelectItem>
                              <SelectItem value="O-">O-</SelectItem>
                              <SelectItem value="Tidak Tahu">Tidak Tahu</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="alamat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan alamat lengkap"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="alergi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alergi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan riwayat alergi (jika ada)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="catatanKhusus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan Khusus</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Masukkan catatan khusus (jika ada)"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/pasien")}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-primary hover:bg-primary-dark"
                      disabled={pendaftaranMutation.isPending}
                    >
                      {pendaftaranMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Simpan Data Pasien
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileNav />
    </div>
  );
}
