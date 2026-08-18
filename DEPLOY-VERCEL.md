# 🚀 Panduan Deploy ke Vercel (Aman)

Panduan langkah demi langkah untuk men-deploy website RT ke **Vercel**, dengan fokus
keamanan: memastikan file rahasia seperti `.env`, database, dan folder `private/`
**tidak pernah bisa diakses orang lain**.

---

## ⚠️ Baca dulu: batasan Vercel (sangat penting)

Vercel adalah platform **serverless** — kode berjalan di fungsi yang bersifat **sementara
(ephemeral)** dan filesystem-nya **hanya bisa dibaca, tidak bisa ditulis permanen**.

Artinya, jika aplikasi ini di-deploy apa adanya:

| Data | Di Vercel | Akibat |
|---|---|---|
| Database SQLite (`prisma/dev.db`) | ❌ Tidak persisten | Data hilang saat instance di-restart |
| Upload gambar (`public/uploads/`, `private/uploads/`) | ❌ Tidak persisten | Foto/bukti hilang sewaktu-waktu |
| Firebase Realtime Database | ✅ Bekerja normal | Sinkronisasi online tetap jalan |

**Kesimpulan: untuk produksi di Vercel, Anda perlu dua layanan tambahan:**

1. **Database**: pindahkan SQLite ke **Turso** (SQLite hosted, kompatibel dengan Prisma).
2. **Upload**: simpan gambar ke **Vercel Blob** (atau Uploadthing/S3).

> Alternatif tanpa ubah kode: deploy di **VPS** (mis. Railway, Render, DigitalOcean)
> yang punya disk permanen — versi "lokal penuh" ini jalan apa adanya.
>
> Langkah-langkah migrasi Turso + Blob dijelaskan di [Bagian 6](#6-opsi-a-migrasi-ke-turso--vercel-blob-disarankan-untuk-produksi).

---

## 1. Pastikan file private TIDAK ikut ke git

File `.gitignore` proyek ini **sudah** mengamankan hal-hal berikut:

```gitignore
# dari .gitignore proyek ini
.env
.env*.local
prisma/*.db
prisma/*.db-journal
public/uploads/*
private/uploads/*
*.pem
.vercel
```

Verifikasi sekali lagi sebelum push (jalankan dari folder proyek):

```bash
# Cek apakah ada file rahasia yang ter-track git (harus KOSONG):
git ls-files | grep -E "\.env|\.db$|uploads/" || echo "OK: tidak ada file rahasia ter-track"
```

> ⚠️ **Jangan pernah** menambahkan `.env` dengan `git add .env` atau `git add -f .env`.
> Jika file `serviceAccountKey.json` Firebase pernah diunduh, jangan taruh di folder proyek
> (atau tambahkan ke `.gitignore`).

**Cara kerja env di Vercel:** file `.env` lokal **tidak pernah dikirim** ke Vercel.
Anda menempelkan nilai variabel langsung di dashboard Vercel (atau lewat CLI
`vercel env add`). Nilai tersimpan **terenkripsi** dan hanya bisa dilihat/diubah
oleh anggota project.

---

## 2. Push kode ke GitHub

```bash
git init
git add .
git commit -m "init website RT"
git branch -M main
git remote add origin https://github.com/USERNAME/nama-repo.git
git push -u origin main
```

Pastikan `.env` dan `prisma/dev.db` **tidak** muncul di repo GitHub (cek di halaman repo).

---

## 3. Buat project di Vercel

1. Masuk ke [vercel.com](https://vercel.com) → **Add New… → Project**.
2. **Import** repo GitHub Anda.
3. Vercel otomatis mendeteksi **Next.js** (build command & output sudah benar).
4. Di bagian **Environment Variables**, tambahkan semua variabel di bawah.
5. Klik **Deploy**.

### Environment Variables yang wajib diisi

| Nama | Contoh | Keterangan |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | Untuk **uji coba saja** — lihat Bagian 6 untuk produksi (Turso) |
| `NEXTAUTH_SECRET` | (acak, lihat bawah) | Kunci sesi login — **wajib acak & rahasia** |
| `NEXTAUTH_URL` | `https://nama-proyek.vercel.app` | URL produksi Anda |
| `FIREBASE_DATABASE_URL` | `https://nama-project-default-rtdb.firebaseio.com` | Opsional (sinkronisasi) |
| `FIREBASE_PROJECT_ID` | `nama-project` | Opsional |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxx@nama-project.iam.gserviceaccount.com` | Opsional |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Opsional (lihat catatan newline) |

Buat `NEXTAUTH_SECRET` acak (jalankan di komputer Anda):

```bash
openssl rand -base64 32
```

> **Catatan `FIREBASE_PRIVATE_KEY`:** kunci berisi karakter newline.
> - Di **dashboard Vercel**, tempel kunci **utuh** (textarea otomatis menyimpan newline
>   aslinya). Kode aplikasi sudah menangani keduanya (newline asli maupun `\n` literal).
> - Jangan pernah menaruh kunci ini di kode atau di file yang di-commit.

---

## 4. Deploy & verifikasi

Setelah deploy selesai, buka URL `https://nama-proyek.vercel.app` dan cek:

- [ ] Halaman beranda, artikel, profil RT tampil
- [ ] Login admin berhasil (`/login`)
- [ ] Registrasi warga berhasil (`/daftar`)
- [ ] Admin → Sinkronisasi Firebase → **Kirim Semua Data** (jika Firebase diisi)
- [ ] URL file rahasia tidak bisa diakses: coba `/private/...`, `.env`, `dev.db` → harus **404**

> Setiap `git push` ke branch `main` akan otomatis membuat **deployment baru** (CI/CD).

---

## 5. Keamanan tambahan (disarankan)

### a. Environment variables bersifat private
- Nilai env di Vercel **tidak pernah** dikirim ke browser pengunjung dan tidak masuk
  ke bundle JavaScript.
- ⚠️ **Jangan pernah** memberi prefix `NEXT_PUBLIC_` pada variabel rahasia — variabel
  dengan prefix itu justru **ikut terkirim ke browser** (terlihat publik).

### b. Lindungi preview deployment
Sebelum rilis, setiap perubahan membuat URL preview (`nama-proyek-xxx.vercel.app`) yang
bisa dibuka siapa saja yang tahu URL-nya. Aktifkan proteksi:

**Settings → Deployment Protection → Vercel Authentication (Preview)** —
hanya orang dengan akun Vercel yang diizinkan yang bisa membuka preview.

### c. Perketat rules Firebase Realtime Database
Karena aplikasi menulis data lewat **Admin SDK** (yang mengabaikan rules), Anda bisa
mengunci database agar publik tidak bisa membaca/menulis langsung:

```
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Dengan ini, siapa pun yang punya URL database tidak bisa mengintip data — hanya server
aplikasi (yang punya kredensial) yang bisa akses.

### d. Jangan pernah log rahasia
Jangan menambahkan `console.log(process.env.NEXTAUTH_SECRET)` atau sejenisnya —
log server Vercel bisa dilihat oleh anggota project.

### e. Domain sendiri (opsional)
**Settings → Domains** → tambahkan domain Anda (mis. `rt05.example.com`) → ikuti
instruksi DNS. Perbarui `NEXTAUTH_URL` setelah itu.

---

## 6. Opsi A: Migrasi ke Turso + Vercel Blob (disarankan untuk produksi)

### 6a. Database → Turso (SQLite hosted)

1. Daftar di [turso.tech](https://turso.tech) → buat database → salin
   `TURSO_DATABASE_URL` (berawal `libsql://`) dan `TURSO_AUTH_TOKEN`.
2. Tambahkan dependensi adapter:
   ```bash
   npm install @prisma/adapter-libsql @libsql/client
   ```
3. Ubah inisialisasi Prisma di `src/lib/prisma.ts` agar memakai adapter libSQL
   (schema tetap `provider = "sqlite"`).
4. Tambahkan env vars di **lokal** lalu siapkan skema & seed dari komputer Anda:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Tambahkan `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` ke **Environment Variables
   Vercel**, lalu deploy ulang.

> Skema & data awal hanya perlu dibuat **sekali** dari komputer Anda — Vercel tidak
> menjalankan `prisma db push` saat build.

### 6b. Upload gambar → Vercel Blob

1. Di dashboard Vercel: **Storage → Create Database → Blob** → salin
   `BLOB_READ_WRITE_TOKEN` (otomatis ditambahkan ke env vars project).
2. Ubah `src/app/api/upload/route.ts` agar menulis ke Vercel Blob dan menyimpan URL
   hasil upload (bukan path lokal). `public/uploads/` dan `private/uploads/` tidak
   lagi dipakai di produksi.
3. Untuk foto KTP yang privat, simpan blob dengan akses terbatas dan tetap sajikan
   lewat `/api/ktp/[userId]` yang memeriksa sesi.

> Perubahan kode untuk 6a dan 6b bisa dikerjakan oleh asisten — cukup minta
> "migrasikan ke Turso dan Vercel Blob".

---

## 7. Checklist sebelum rilis

- [ ] `.env` tidak ada di GitHub (`git ls-files | grep .env` kosong)
- [ ] `NEXTAUTH_SECRET` acak & tidak pernah di-commit
- [ ] `NEXTAUTH_URL` = URL produksi
- [ ] Database produksi (Turso) sudah di-seed & terhubung
- [ ] Firebase rules dikunci (`.read/.write: false`)
- [ ] Deployment Protection aktif untuk preview
- [ ] Tidak ada `NEXT_PUBLIC_` pada variabel rahasia
- [ ] Test: login admin, registrasi warga, upload gambar, cetak laporan
- [ ] Coba akses `/private/`, `.env`, `dev.db` → 404

---

## Troubleshooting singkat

| Gejala | Penyebab & solusi |
|---|---|
| Login gagal / sesi hilang setelah deploy | `NEXTAUTH_SECRET` beda antar environment atau tidak diisi. Isi nilai yang sama di semua environment (Production/Preview/Development). |
| Data & upload hilang di Vercel | SQLite/file lokal tidak persisten → ikuti Bagian 6 (Turso + Blob). |
| Foto KTP 404 | File ada di instance serverless yang berbeda → wajib pindah ke Blob (Bagian 6b). |
| Sinkronisasi Firebase tidak jalan | Cek 4 variabel `FIREBASE_*` sudah diisi & `FIREBASE_PRIVATE_KEY` disalin utuh. |
| Build gagal di Vercel | Lihat log build di tab **Deployments**; pastikan tidak ada file rahasia yang di-import dari path lokal. |
