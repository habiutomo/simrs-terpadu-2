import React from "react";
import { APPOINTMENTS_DATA } from "@/lib/constants";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const getStatusClasses = (status: string) => {
  switch (status) {
    case "success":
      return "bg-success bg-opacity-10 text-success";
    case "warning":
      return "bg-warning bg-opacity-10 text-warning";
    case "error":
      return "bg-error bg-opacity-10 text-error";
    default:
      return "bg-neutral-200 text-neutral-500";
  }
};

const AppointmentTable: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow col-span-1 lg:col-span-2">
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-600">Janji Dokter Hari Ini</h3>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Pasien
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Dokter
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {APPOINTMENTS_DATA.map((appointment) => (
                <tr key={appointment.id} className="border-b border-neutral-200 hover:bg-neutral-50">
                  <td className="px-3 py-3 text-sm text-neutral-500">
                    {appointment.time}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
                          ${appointment.id % 3 === 0 ? 'bg-error' : 
                            appointment.id % 2 === 0 ? 'bg-secondary' : 'bg-primary-dark'}`}
                      >
                        <span>{appointment.patient.initials}</span>
                      </div>
                      <div className="ml-2">
                        <p className="text-sm font-medium text-neutral-600">{appointment.patient.name}</p>
                        <p className="text-xs text-neutral-400">
                          {appointment.patient.age} Tahun, {appointment.patient.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-sm text-neutral-600">
                    {appointment.doctor}
                  </td>
                  <td className="px-3 py-3 text-sm text-neutral-600">
                    {appointment.type}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClasses(appointment.statusColor)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <Link href="/appointments">
            <a className="text-primary text-sm hover:underline">
              Lihat Semua Janji Dokter
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
