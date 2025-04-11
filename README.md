# SIMRS - Sistem Informasi Manajemen Rumah Sakit

![SIMRS Logo](generated-icon.png)
![SIMRS Logo](1.png)
![alt text](2.png)
![alt text](3.png)
![alt text](4.png)

## Tentang SIMRS

SIMRS (Sistem Informasi Manajemen Rumah Sakit) adalah aplikasi komprehensif untuk mengelola operasional rumah sakit dengan integrasi Satu Sehat. Sistem ini dirancang untuk membantu rumah sakit di Indonesia dalam mendigitalisasi dan mengoptimalkan proses operasional mereka, mulai dari pendaftaran pasien hingga rekam medis elektronik.

## Fitur Utama

### Manajemen Pasien
- Pendaftaran pasien baru
- Pencarian data pasien
- Manajemen data demografi pasien
- Riwayat kunjungan

### Jadwal dan Appointment
- Penjadwalan kunjungan dokter
- Manajemen jadwal poli
- Notifikasi jadwal terintegrasi
- Status konfirmasi kunjungan

### Rekam Medis Elektronik
- Pembuatan dan pengelolaan rekam medis
- Pencatatan diagnosis, tindakan, dan resep
- Integrasi dengan modul farmasi, laboratorium, dan radiologi
- Ekspor dan impor data rekam medis

### Rawat Jalan
- Manajemen antrian poli
- Pencatatan vital sign
- Konsultasi dokter
- Rujukan ke layanan lain

### Rawat Inap
- Manajemen kamar rawat inap
- Pencatatan tindakan selama rawat inap
- Monitoring status pasien
- Perhitungan biaya rawat inap

### Farmasi
- Manajemen inventaris obat
- Pelayanan resep
- Otomatisasi stok minimum
- Laporan penggunaan obat

### Laboratorium
- Permintaan pemeriksaan lab
- Pencatatan hasil lab
- Integrasi dengan rekam medis
- Laporan hasil laboratorium

### Radiologi
- Permintaan pemeriksaan radiologi
- Pencatatan hasil pemeriksaan
- Manajemen gambar radiologi
- Integrasi dengan rekam medis

### Laporan dan Analitik
- Dashboard statistik rumah sakit
- Laporan kunjungan pasien
- Analisis pendapatan dan pengeluaran
- Pelaporan untuk kebutuhan akreditasi

### Integrasi Satu Sehat
- Sinkronisasi data dengan FHIR Satu Sehat
- Validasi data sesuai standar Satu Sehat
- Monitoring status integrasi
- Pengaturan credential dan API

## Teknologi

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL via Drizzle ORM
- **Autentikasi**: Passport.js dengan session management
- **State Management**: TanStack Query (React Query)

## Persyaratan Sistem

- Node.js v18 atau lebih tinggi
- npm atau yarn
- PostgreSQL (opsional, dapat menggunakan in-memory storage untuk pengembangan)

## Instalasi

### 1. Clone repositori

```bash
git clone https://github.com/username/simrs.git
cd simrs
```

### 2. Instal dependensi

```bash
npm install
```

### 3. Set up variabel lingkungan

Buat file `.env` di root proyek:

```
DATABASE_URL=postgresql://username:password@localhost:5432/simrs
SESSION_SECRET=your-session-secret
PORT=5000
```

### 4. Jalankan aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5000`

## Login Sistem

Untuk akses demo, gunakan kredensial berikut:

- **Username**: admin
- **Password**: admin123

## Integrasi Satu Sehat

Untuk integrasi dengan Satu Sehat, konfigurasikan pengaturan berikut di menu Pengaturan > Integrasi Satu Sehat:

1. Client ID (dari portal pengembang Satu Sehat)
2. Client Secret
3. Organization ID (ID Faskes terdaftar)
4. API Endpoint
5. Atur jadwal sinkronisasi

## Dukungan Browser

- Chrome (versi 2 terakhir)
- Firefox (versi 2 terakhir)
- Edge (versi 2 terakhir)
- Safari (versi 2 terakhir)

## Troubleshooting

### Database tidak terhubung
- Pastikan kredensial database benar di file `.env`
- Pastikan database PostgreSQL berjalan
- Verifikasi firewall tidak memblokir koneksi database

### Masalah API Satu Sehat
- Pastikan credential Satu Sehat valid
- Periksa log untuk detail error
- Validasi format data yang dikirim ke Satu Sehat

## Pengembangan

### Struktur Kode

```
simrs/
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/   # Komponen React reusable
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utilitas dan konfigurasi
│   │   ├── pages/        # Halaman aplikasi
│   │   └── ...
├── server/              # Backend Express
│   ├── index.ts          # Entry point server
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage abstraction
│   ├── auth.ts           # Authentication logic
│   └── ...
├── shared/              # Kode yang digunakan frontend & backend
│   └── schema.ts         # Database schema & types
└── ...
```

### Penambahan Fitur

Untuk menambahkan fitur baru:

1. Tambahkan tipe data di `shared/schema.ts`
2. Implementasikan endpoint API di `server/routes.ts`
3. Buat halaman React di `client/src/pages/`
4. Tambahkan rute di `client/src/App.tsx`

## Kontribusi

Kontribusi dipersilakan! Untuk berkontribusi pada proyek ini:

1. Fork repositori
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur xyz'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

## Kontak

habizinnia@gmail.com