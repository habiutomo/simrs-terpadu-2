// Navigation links for the sidebar
// Template user data
export const USER_DATA = {
  id: 1,
  username: "admin",
  name: "Administrator",
  role: "Administrator",
  facilityName: "RSUD Harapan Bunda"
};

export interface NavLink {
  href: string;
  icon: string;
  label: string;
  parent?: string;
  isSubmenu?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", icon: "home", label: "Dashboard" },
  { href: "/patients", icon: "person", label: "Pasien" },
  { href: "/appointments", icon: "calendar_month", label: "Jadwal & Appointment" },
  { href: "/medical-records", icon: "description", label: "Rekam Medis" },
  { href: "/inpatient", icon: "hotel", label: "Rawat Jalan" },
  { href: "/pharmacy", icon: "medication", label: "Farmasi" },
  { href: "/laboratory", icon: "science", label: "Laboratorium" },
  { href: "/radiology", icon: "radioactive", label: "Radiologi" },
  { href: "/reports", icon: "bar_chart", label: "Laporan" },
  { href: "/settings", icon: "settings", label: "Pengaturan" },
];

// Quick access shortcuts for the dashboard
export const QUICK_ACCESS_LINKS = [
  { href: "/patients/register", icon: "person_add", label: "Daftar Pasien Baru" },
  { href: "/appointments/create", icon: "event_note", label: "Buat Janji Dokter" },
  { href: "/medical-records/create", icon: "note_add", label: "Buat Rekam Medis" },
  { href: "/pharmacy/create-order", icon: "local_pharmacy", label: "Order Farmasi" },
  { href: "/billing/create-invoice", icon: "receipt_long", label: "Buat Invoice" },
  { href: "/reports", icon: "assessment", label: "Laporan" },
];

// Dummy stats data for demo
export const STATS_DATA = [
  { id: 1, label: "Total Pasien", value: "1,243", icon: "people", color: "primary" },
  { id: 2, label: "Janji Dokter Hari Ini", value: "32", icon: "event", color: "secondary" },
  { id: 3, label: "Total Resep Hari Ini", value: "18", icon: "medication", color: "success" },
  { id: 4, label: "Total Pendapatan Hari Ini", value: "Rp 12,5jt", icon: "receipt", color: "warning" }
];

// Dummy Satu Sehat status data for demo
export const SATU_SEHAT_STATUS = [
  { label: "Data Pasien", value: 100, status: "Tersinkronisasi", color: "success" },
  { label: "Rekam Medis", value: 75, status: "Sebagian", color: "warning" },
  { label: "Data Obat", value: 35, status: "Perlu Sinkronisasi", color: "error" },
  { label: "Data Kunjungan", value: 95, status: "Tersinkronisasi", color: "success" }
];

// Dummy user for demo
export const DOCTOR_USER = {
  id: 1,
  name: "Dr. Rahmat",
  role: "Dokter Umum",
  initials: "DR",
};

// Dummy appointments for demo
export const APPOINTMENTS_DATA = [
  {
    id: 1,
    time: "08:00",
    patient: { name: "Budi Prasetyo", age: 42, gender: "Laki-laki", initials: "BP" },
    doctor: "Dr. Siti Aminah",
    type: "Konsultasi",
    status: "Hadir",
    statusColor: "success"
  },
  {
    id: 2,
    time: "09:15",
    patient: { name: "Ratna Wulandari", age: 35, gender: "Perempuan", initials: "RW" },
    doctor: "Dr. Ahmad Fauzi",
    type: "Pemeriksaan",
    status: "Menunggu",
    statusColor: "warning"
  },
  {
    id: 3,
    time: "10:30",
    patient: { name: "Andi Suryana", age: 28, gender: "Laki-laki", initials: "AS" },
    doctor: "Dr. Tina Wijaya",
    type: "Kontrol",
    status: "Terjadwal",
    statusColor: "neutral"
  }
];

// Dummy activities for demo
export const ACTIVITIES_DATA = [
  {
    id: 1,
    user: { name: "Dr. Ahmad", icon: "person", color: "primary" },
    action: "menambahkan rekam medis baru untuk",
    target: "Budi Prasetyo",
    timestamp: "10 menit yang lalu"
  },
  {
    id: 2,
    user: { name: "Apt. Siti", icon: "medication", color: "success" },
    action: "memproses resep obat untuk",
    target: "Ratna Wulandari",
    timestamp: "25 menit yang lalu"
  },
  {
    id: 3,
    user: { name: "Admin Dewi", icon: "event", color: "warning" },
    action: "mengubah jadwal janji dokter untuk",
    target: "Hendra Setiawan",
    timestamp: "45 menit yang lalu"
  },
  {
    id: 4,
    user: { name: "Finance Indah", icon: "receipt", color: "error" },
    action: "membuat invoice baru untuk",
    target: "Rini Agustina",
    timestamp: "1 jam yang lalu"
  }
];
