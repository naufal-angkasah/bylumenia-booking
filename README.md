# Bylumenia • Sistem Pemesanan Sinematik & Galeri Visual

> **Butik Visual Pernikahan & Prewedding** — *Merekam kedalaman emosi, gestur mikro, dan keabadian rasa di atas sekadar kuantitas.*  
> Area Layanan: Semarang, Solo, Yogyakarta, & Luar Kota.

---

## ✦ Tentang Proyek

**Bylumenia Booking System** dirancang untuk mentransformasi formulir pemesanan konvensional menjadi sebuah ruang temu sinematik yang hangat dan menggugah emosi (*emotional storytelling*). Calon pengantin dihantar melalui narasi puitis sembari menyaksikan cuplikan video karya asli, menyaring kesungguhan visi mereka sebelum mengunci jadwal dan menyematkan tanda jadi (DP).

Dibangun berdasarkan spesifikasi **Product Engineering Specification V1.0** oleh tim pengembang **Outlook Universe (OUNERS)** bekerja sama dengan **@hai_ivaan** & brand **@bylumenia**.

---

## ✦ Fitur Unggulan

### 1. Antarmuka Dark Luxury Glassmorphism
* **Latar Obsidian Black (`#0A0A0A`)** berpadu vignette sinematik.
* **Komponen Kaca**: `backdrop-blur: 16px`, border halus 1px solid `rgba(255, 255, 255, 0.08)`.
* **Aksen Warm Champagne Gold (`#D4AF37`)** pada tombol aktif & tipografi Serif (*Cormorant Garamond*).
* **Floating Capsule Navbar**: Melayang di bagian atas dengan transisi kaca adaptif saat digulir.

### 2. Hero Banner Sinematik & Galeri "Kisah Kamu"
* **Hero Banner Autoplay**: Memutar video asli *Teaser from Wedding Aristia & Ivan* secara mulus dan hening (*playsInline*, *muted*, *loop*).
* **Galeri "Kisah Kamu"**: Adaptasi feed Instagram terkurasi (siluet gaun putih, cincin batuan alam, kebaya beludru adat Jawa, siraman melati, hingga tawa kasual di padang terbuka) lengkap dengan modal *lightbox*.

### 3. Formulir Pemesanan Interaktif Sinematik (3 Sesi)
Model **Popup / Full-screen Drawer** yang sangat ramah pengguna *smartphone* (mobile-first) maupun desktop:
* **Sesi 1 (Titik Temu & Skenario Semesta)**:
  * Video Latar: *A love story, rooted in heritage*
  * Input Nama Pasangan, WhatsApp Aktif, Kota & Venue Acara.
  * **Kalender Interaktif**: Pengecekan ketersediaan jadwal secara *real-time* dengan pesan puitis: *"Semesta merestui hari itu, pintu jadwal kami masih terbuka luas."*
* **Sesi 2 (Menenun Rasa & Pilihan Paket)**:
  * Video Latar: *Mazi ftiáchnoume to méllon mas*
  * Pilihan Suasana Visual: *Teduh & Khidmat*, *Anggun Berbalut Cerita*, atau *Riuh Penuh Tawa*.
  * Pilihan Paket: *Babak Awal (Prewedding)*, *Hari Penyatuan Janji (Wedding Day)*, atau *Perjalanan Utuh (Complete Journey)*.
* **Sesi 3 (Mengunci Komitmen & Tanda Jadi)**:
  * **Mesin Anti Double-Booking (Hold Slot 30 Menit)**: Tanggal otomatis ditahan selama 30 menit dengan *countdown timer* halus.
  * **Kalkulasi DP 30% Otomatis + 3 Digit Acak Unik** untuk kemudahan verifikasi transfer.
  * Saluran Pembayaran: Rekening resmi BCA & Mandiri (tombol salin 1-klik) dan QRIS terintegrasi.
  * Unggah Foto Bukti Transfer (.jpg, .png, .pdf maks 5 MB).
  * Layar Sukses & Selebrasi: Konfeti emas, teks penutup hangat, dan tombol langsung terhubung ke WhatsApp kurator.

### 4. Dasbor Kurator Internal (`/admin`)
* **Gerbang Keamanan PIN**: Akses terproteksi kode rahasia kurator (Default: `1928`).
* **Ringkasan Metrik**: Total reservasi, slot menunggu verifikasi, jadwal aktif, dan total DP masuk.
* **Manajemen Jadwal**: Tabel interaktif dengan pratinjau bukti transfer *zoomable*, tombol konfirmasi/tolak jadwal, dan tautan kirim pesan WhatsApp otomatis dengan template sapaan santun.
* **Jejak Waktu (Audit Logs)**: Pencatatan waktu penahanan slot (*hold*), unggah bukti, konfirmasi kurator, dan pelepasan jadwal (*auto-release*).

---

## ✦ Tumpukan Teknologi (Tech Stack)

* **Frontend Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) + Glassmorphism Custom Utilities
* **Animasi & Interaktivitas**: [Framer Motion](https://www.framer.com/motion/) + Canvas Confetti
* **Ikon**: [Lucide React](https://lucide.dev/)
* **Database & ORM**: [Prisma ORM](https://www.prisma.io/)
  * *Lokal*: SQLite (`dev.db` zero-config)
  * *Produksi*: PostgreSQL (didukung penuh via Supabase / Neon / Vercel Postgres)

---

## ✦ Panduan Menjalankan di Lokal (Local Development)

### 1. Kloning & Pemasangan Dependensi
```bash
git clone https://github.com/naufal-angkasah/bylumenia-booking.git
cd bylumenia-booking
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin berkas `.env.example` menjadi `.env`:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PIN="1928"
NEXT_PUBLIC_ADMIN_WHATSAPP="6281234567890"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Inisialisasi Database
```bash
npx prisma db push
```

### 4. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada:
* **Halaman Web & Reservasi**: [http://localhost:3000](http://localhost:3000)
* **Dasbor Kurator Admin**: [http://localhost:3000/admin](http://localhost:3000/admin) *(Masukkan PIN: `1928`)*

---

## ✦ Panduan Deploy ke Vercel & Supabase

1. **Buat Database di [Supabase](https://supabase.com/)**:
   * Buat *New Project* baru.
   * Ambil string koneksi PostgreSQL pada menu *Settings &rarr; Database &rarr; Connection string (URI)*.
2. **Ganti Provider Prisma ke PostgreSQL (Khusus Deploy)**:
   Pada `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   Jalankan `npx prisma db push`.
3. **Deploy di [Vercel](https://vercel.com/)**:
   * Hubungkan repositori GitHub ini ke Vercel.
   * Tambahkan Environment Variables di Vercel:
     * `DATABASE_URL`: URI PostgreSQL Supabase
     * `ADMIN_PIN`: PIN kurator yang diinginkan
     * `NEXT_PUBLIC_ADMIN_WHATSAPP`: Nomor WhatsApp resmi kurator Bylumenia
   * Klik **Deploy**.

---

## ✦ Struktur Direktori

```text
bylumenia/
├── prisma/
│   └── schema.prisma          # Skema Prisma (Booking, FormConfig, SystemLog)
├── public/
│   ├── videos/                # Aset video kompresi (hero & form steps)
│   └── uploads/proofs/        # Direktori slip transfer terunggah
├── src/
│   ├── app/
│   │   ├── admin/page.tsx     # Dasbor Kurator Internal
│   │   ├── api/bookings/      # Endpoint: check-date, create-hold, upload-proof
│   │   ├── api/admin/         # Endpoint: admin bookings & status management
│   │   ├── globals.css        # Glassmorphic utilities & custom scrollbar
│   │   ├── layout.tsx         # Typography & Root metadata
│   │   └── page.tsx           # Halaman Utama (Landing Page)
│   ├── components/
│   │   ├── Navbar.tsx         # Floating Capsule Navbar
│   │   ├── HeroSection.tsx    # Video Hero Looping Banner
│   │   ├── GallerySection.tsx # Galeri "Kisah Kamu" + Lightbox
│   │   ├── PackagesSection.tsx# Katalog 3 Paket Cerita
│   │   ├── PhilosophySection.tsx# Nilai & Gestur Mikro Bylumenia
│   │   ├── BookingModal.tsx   # Popup Interaktif Sinematik (3 Sesi)
│   │   └── Footer.tsx         # Informasi Butik & Tautan Sosial
│   └── lib/
│       ├── constants.ts       # Data galeri, paket, mood, & bank
│       └── prisma.ts          # Singleton Prisma Client
├── .env.example
├── package.json
└── README.md
```

---

## ✦ Kontributor & Kredit
* **Klien / Kurator Utama**: Mas Ivaan ([@hai_ivaan](https://www.instagram.com/hai_ivaan)) & **[@bylumenia](https://www.instagram.com/bylumenia)**
* **Desain & Rekayasa Perangkat Lunak**: **Outlook Universe (OUNERS)**
