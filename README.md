# Website Resmi RT — Publikasi Organisasi & Transparansi Keuangan

Website untuk Rukun Tetangga (RT) yang berisi publikasi artikel/pengumuman, profil organisasi,
struktur pengurus, serta laporan keuangan yang transparan dan dapat dicetak sebagai PDF.

Dibangun dengan **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma (SQLite) + NextAuth**.

> 🚀 **Mau deploy?**
> - [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) — panduan deploy ke Vercel yang aman (melindungi `.env`, migrasi Turso + Blob).
> - [DEPLOY-GRATIS.md](./DEPLOY-GRATIS.md) — rekomendasi & tutorial **deploy gratis** (Vercel+Turso+Blob, Cloudflare, atau VPS gratis).

## Fitur

### Publik
- **Beranda** — hero profil RT, statistik, artikel terbaru, visi & misi.
- **Artikel & Pengumuman** — daftar artikel dengan pencarian, filter kategori, dan pagination; detail artikel dengan editor markdown (judul, gambar, daftar, kutipan, dll).
- **Profil RT** — identitas, alamat, kontak, visi & misi.
- **Struktur Organisasi** — susunan pengurus per kelompok/seksi, diatur dari admin panel.
- **Registrasi Warga** — form lengkap sesuai data KTP Indonesia:
  - NIK 16 digit (divalidasi), nama, tempat & tanggal lahir, jenis kelamin, agama,
    status perkawinan, pekerjaan, kewarganegaraan, alamat (RT/RW, kelurahan, kecamatan,
    kota, provinsi, kode pos), kontak, dan unggah foto KTP.
- **Login** — akun admin dan warga.

### Warga terdaftar (login)
- **Dashboard warga** — ringkasan data diri sesuai KTP dan tautan cepat.
- **Direktori Warga** (`/warga`) — daftar warga terdaftar; klik nama untuk melihat profil.
  Data sensitif (NIK, nomor HP, email, tanggal lahir, dan foto KTP) **hanya terlihat oleh
  admin dan pemilik akun**; warga lain hanya melihat data dasar.
- **Laporan Keuangan** — rekap kas RT (pemasukan, pengeluaran, saldo, rekap per kategori),
  filter bulan/tahun/jenis, bukti transaksi dapat dilihat, dan **cetak / simpan sebagai PDF**
  lengkap dengan **tanda tangan Ketua & Bendahara serta stempel** yang menimpa tanda tangan
  Ketua di sisi kanan (seperti laporan asli).

### Admin panel (`/admin`)
- **Dashboard** — statistik artikel, kas bulan berjalan, jumlah warga.
- **Kelola Artikel** — tulis/edit/hapus artikel, unggah gambar sampul, kategori, status terbit/draft.
- **Kelola Keuangan** — catat pemasukan & pengeluaran lengkap dengan kategori, tanggal,
  keterangan, dan **unggah bukti transaksi**; edit/hapus; kelola kategori.
- **Laporan & Cetak PDF** — laporan keuangan siap cetak dengan kop dan tanda tangan.
- **Profil RT** — atur identitas, alamat, logo, visi misi, serta nama Ketua/Bendahara
  untuk tanda tangan laporan.
- **Struktur Organisasi** — tambah/edit/hapus pengurus, atur kelompok/seksi, urutan, foto, dan visibilitas.
- **Data Warga** — kelola akun warga: cari, klik nama untuk melihat profil lengkap (termasuk foto KTP),
  jadikan admin, aktifkan/nonaktifkan, hapus.
- **Tanda Tangan & Stempel** (`/admin/tandatangan`) — unggah tanda tangan Ketua, Bendahara,
  dan stempel/cap RT untuk dicetak pada laporan keuangan.
- **Akun Admin** (`/admin/akun`) — ganti email dan password login admin (perlu password
  saat ini; perubahan otomatis tersinkron ke Firebase).
- **Sinkronisasi Firebase** (`/admin/sinkronisasi`) — status koneksi, **kirim semua data ke
  Firebase** (backup online) dan **ambil data dari Firebase** (restore).

## Persyaratan

- Node.js 18.17+ (disarankan 20+)
- npm

## Menjalankan

```bash
# 1. Install dependensi
npm install

# 2. Siapkan database & seed data awal
npm run db:setup        # = prisma db push + prisma db seed

# 3. Jalankan mode pengembangan
npm run dev             # buka http://localhost:3000

# atau mode produksi
npm run build
npm start
```

File `.env` (sudah disertakan untuk pengembangan lokal):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<ganti dengan secret acak Anda>"
NEXTAUTH_URL="http://localhost:3000"

# === Firebase Realtime Database (opsional) ===
FIREBASE_DATABASE_URL=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

> Untuk produksi, ganti `NEXTAUTH_SECRET` dengan nilai acak
> (mis. `openssl rand -base64 32`) dan sesuaikan `NEXTAUTH_URL`.

## Sinkronisasi Online dengan Firebase Realtime Database

Aplikasi menyimpan data di database lokal (SQLite) dan **otomatis menyalinnya ke Firebase
Realtime Database** agar ada salinan online. Setiap perubahan (registrasi warga, artikel,
transaksi, kategori, struktur, pengaturan) langsung dikirim ke Firebase. Dari panel admin
(`/admin/sinkronisasi`) Anda juga bisa melakukan **backup penuh** (kirim semua data) dan
**restore** (ambil data dari Firebase yang belum ada di lokal).

Jika kredensial Firebase belum diisi, aplikasi tetap berjalan normal (mode lokal saja).

### Cara setup Firebase (sekali saja)

1. **Buat project** di [Firebase Console](https://console.firebase.google.com) → *Add project*.
2. **Aktifkan Realtime Database**: menu *Build → Realtime Database* → *Create database* →
   pilih lokasi → mode *Test mode* dulu (bisa diperketat nanti).
   Salin **Database URL**-nya, contoh: `https://nama-project-default-rtdb.firebaseio.com`.
3. **Buat kunci service account**: *Project settings (ikon gerigi) → tab Service accounts →
   Generate new private key* → unduh file JSON.
4. Isi 4 variabel di `.env`:
   - `FIREBASE_DATABASE_URL` — Database URL dari langkah 2.
   - `FIREBASE_PROJECT_ID` — dari file JSON (`project_id`).
   - `FIREBASE_CLIENT_EMAIL` — dari file JSON (`client_email`).
   - `FIREBASE_PRIVATE_KEY` — dari file JSON (`private_key`), disalin utuh termasuk
     `-----BEGIN PRIVATE KEY-----` … `-----END PRIVATE KEY-----`.
5. Restart server (`npm run dev` / `npm run build && npm start`), buka
   **Admin → Sinkronisasi Firebase** → klik **Kirim Semua Data ke Firebase**.

> Keamanan: data warga (termasuk hash password) ikut tersinkron agar restore tetap berfungsi.
> Pastikan aturan (rules) Realtime Database Anda dibatasi untuk aplikasi ini. Foto KTP **tidak**
> ikut disinkron — foto KTP selalu tersimpan di folder `private/` di server dan hanya bisa
> diakses oleh admin atau pemilik akun.

## Akun Demo (hasil seed)

| Peran  | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | `admin@rt.com`     | `admin123`|
| Warga  | `warga@example.com`| `warga123`|

## Struktur Proyek

```
prisma/
  schema.prisma     # Model: User, Article, FinanceCategory, Transaction, Setting, OrgMember
  seed.ts           # Data awal: admin, warga demo, profil, kategori, pengurus, artikel contoh
private/
  uploads/ktp/      # Foto KTP (folder private — tidak bisa diakses publik)
public/
  uploads/          # Gambar publik: sampul artikel, bukti transaksi, logo, tanda tangan, stempel
src/
  actions/          # Server actions (registrasi, artikel, keuangan, profil, struktur, user, sinkronisasi)
  app/              # Halaman & API routes (App Router)
    admin/          # Panel admin (termasuk tandatangan & sinkronisasi)
    artikel/        # Daftar & detail artikel
    profil/         # Profil RT & struktur organisasi
    warga/          # Direktori warga & profil warga (login)
    daftar/         # Registrasi warga (data KTP)
    login/          # Halaman masuk
    dashboard/      # Dashboard warga
    laporan-keuangan/  # Laporan keuangan + cetak PDF (tanda tangan & stempel)
    api/upload/     # Endpoint unggah gambar (public/private sesuai jenis)
    api/ktp/[userId]/ # Endpoint foto KTP (khusus admin/pemilik)
    uploads/[filename]/ # Penyajian file upload dari disk
  components/       # Komponen UI bersama
  lib/              # Prisma client, konfigurasi auth, utilitas, Firebase & sinkronisasi
  middleware.ts     # Proteksi route berdasarkan peran
```

## Catatan

- Gambar yang diunggah disimpan di `public/uploads/` (maks 5MB per file; JPG/PNG/WebP/GIF).
- Foto KTP disimpan di `private/uploads/ktp/` dan hanya bisa diakses oleh admin atau pemilik akun
  melalui `/api/ktp/[userId]`.
- Database SQLite disimpan di `prisma/dev.db`.
- Cetak PDF memanfaatkan dialog cetak browser (Ctrl+P / Cmd+P → "Simpan sebagai PDF").
