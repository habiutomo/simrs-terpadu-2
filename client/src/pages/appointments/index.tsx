import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Appointment, type Patient, type User } from "@shared/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar, Eye, Plus } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AppointmentData extends Appointment {
  patientName?: string;
  doctorName?: string;
}

const AppointmentsIndex: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", { date: selectedDate }],
  });
  
  const { data: patients } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });
  
  const { data: doctors } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });
  
  // Combine appointment data with patient and doctor names
  const appointmentsWithNames: AppointmentData[] = React.useMemo(() => {
    if (!appointments || !patients || !doctors) return [];
    
    return appointments.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patientId);
      const doctor = doctors.find(d => d.id === appointment.doctorId);
      
      return {
        ...appointment,
        patientName: patient?.name,
        doctorName: doctor?.name
      };
    });
  }, [appointments, patients, doctors]);
  
  // Get today's date and format it
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Get the day of the week for the selected date
  const getDayName = (dateStr: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };
  
  const columns: ColumnDef<AppointmentData>[] = [
    {
      accessorKey: "appointmentTime",
      header: "Waktu",
      cell: ({ row }) => {
        return <div>{row.getValue("appointmentTime")}</div>;
      },
    },
    {
      accessorKey: "patientName",
      header: "Pasien",
      cell: ({ row }) => {
        const patient = patients?.find(p => p.id === row.original.patientId);
        if (!patient) return "-";
        
        const initials = patient.name.split(" ").map(n => n[0]).join("").toUpperCase();
        
        return (
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs bg-primary`}>
              <span>{initials}</span>
            </div>
            <div className="ml-2">
              <p className="text-sm font-medium text-neutral-600">{patient.name}</p>
              <p className="text-xs text-neutral-400">
                {new Date(patient.birthDate).getFullYear() 
                  ? `${new Date().getFullYear() - new Date(patient.birthDate).getFullYear()} Tahun, `
                  : ""}
                {patient.gender === "male" ? "Laki-laki" : "Perempuan"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "doctorName",
      header: "Dokter",
      cell: ({ row }) => {
        const doctor = doctors?.find(d => d.id === row.original.doctorId);
        return <div>{doctor?.name || "-"}</div>;
      },
    },
    {
      accessorKey: "type",
      header: "Tipe",
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
            case "in-progress":
              return "bg-success bg-opacity-10 text-success";
            case "scheduled":
              return "bg-neutral-200 text-neutral-500";
            case "waiting":
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
            case "in-progress": return "Hadir";
            case "scheduled": return "Terjadwal";
            case "waiting": return "Menunggu";
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
      header: "Aksi",
      cell: ({ row }) => {
        const appointment = row.original;
        
        return (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/appointments/${appointment.id}`}>
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
  
  const dateOptions = [];
  for (let i = -3; i <= 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const formattedDate = format(date, 'yyyy-MM-dd');
    dateOptions.push({
      value: formattedDate,
      label: `${i === 0 ? 'Hari Ini' : format(date, 'dd MMM yyyy')} (${getDayName(formattedDate)})`
    });
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Janji Dokter</h1>
        <Button asChild>
          <Link href="/appointments/create">
            <a className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Buat Janji Dokter</span>
            </a>
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">Jadwal</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Jadwal Janji Dokter</CardTitle>
                
                <div className="w-72">
                  <Select 
                    value={selectedDate} 
                    onValueChange={setSelectedDate}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dateOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Memuat data...</p>
                </div>
              ) : (
                <DataTable 
                  columns={columns} 
                  data={appointmentsWithNames} 
                  searchKey="patientName"
                  searchPlaceholder="Cari nama pasien..."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Janji Dokter</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Fitur ini akan menampilkan riwayat janji dokter yang telah selesai.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsIndex;
