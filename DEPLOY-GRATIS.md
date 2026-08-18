# 🆓 Rekomendasi & Tutorial Deploy GRATIS

Panduan memilih dan men-deploy website RT **tanpa biaya bulanan**, tetap stabil dan lancar.
Dibuat khusus untuk arsitektur aplikasi ini: **Next.js + SQLite (Prisma) + upload file lokal + Firebase RTDB**.

---

## 1. Rekomendasi singkat

| Opsi | Biaya | Ubah kode? | Tingkat kesulitan | Keandalan |
|---|---|---|---|---|
| 🥇 **Vercel (Hobby) + Turso + Vercel Blob** | Rp 0 | Kecil (1–2 file) | Mudah | ⭐⭐⭐⭐⭐ Paling lancar |
| 🥈 **Cloudflare Pages + D1 + R2** | Rp 0 | Besar | Sedang | ⭐⭐⭐⭐ |
| 🥉 **VPS gratis (GCP e2-micro / Oracle)** | Rp 0 | Tidak ada | Sulit (admin Linux) | ⭐⭐⭐ (Oracle berisiko di-reclaim) |
| ❌ Fly.io | Free tier **dihapus** 2026 | – | – | Tidak lagi gratis |
| ❌ Render / Railway | Trial / berbayar | – | – | Tidak gratis jangka panjang |
| ❌ Glitch / Koyeb | Gratis tapi disk **sementara** | – | – | Data bisa hilang |

> **Kesimpulan:** untuk website RT (traffic kecil), rekomendasi terbaik adalah
> **Vercel + Turso + Vercel Blob** — semuanya gratis, dikelola penuh (tidak perlu urus
> server), HTTPS otomatis, dan tidak ada risiko data hilang.

---

## 2. 🥇 Opsi utama: Vercel (gratis) + Turso (gratis) + Vercel Blob (gratis)

**Kenapa kombinasi ini?**
- **Vercel Hobby** — hosting gratis ($0) untuk proyek personal, bandwidth 100 GB/bulan, HTTPS + CI/CD otomatis.
- **Turso** — SQLite *hosted* (serverless), gratis: penyimpanan ~9 GB, 1 miliar baris baca/bulan.
  Kompatibel penuh dengan Prisma → kode query **tidak berubah**.
- **Vercel Blob** — penyimpanan file gratis (~1 GB, cukup untuk foto RT), URL permanen.

> ⚠️ Vercel bersifat *serverless*: database SQLite lokal & folder upload **tidak persisten**.
> Karena itu SQLite dipindah ke Turso dan upload ke Vercel Blob (lihat Langkah 3).

### Langkah 1 — Push kode ke GitHub (tanpa file rahasia)

```bash
git init && git add . && git commit -m "init website RT"
git branch -M main
git remote add origin https://github.com/USERNAME/nama-repo.git
git push -u origin main
```

Verifikasi tidak ada file rahasia ter-track (harus kosong):

```bash
git ls-files | grep -E "\.env|\.db$|uploads/" || echo "OK: aman"
```

### Langkah 2 — Buat akun & database gratis

| Layanan | Tautan | Yang dibuat |
|---|---|---|
| Vercel | vercel.com | Import repo GitHub |
| Turso | turso.tech | Buat database → salin `TURSO_DATABASE_URL` (`libsql://...`) & `TURSO_AUTH_TOKEN` |
| Vercel Blob | vercel.com → Storage → Blob | Otomatis menambah `BLOB_READ_WRITE_TOKEN` |

### Langkah 3 — Migrasi kode (sekali saja)

**3a. Database → Turso** (hanya 2 file berubah):

```bash
npm install @prisma/adapter-libsql @libsql/client
```

`prisma/schema.prisma` — ubah baris url:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("TURSO_DATABASE_URL")
}
```

`src/lib/prisma.ts` — pakai adapter libSQL:

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaLibSQL({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Siapkan skema & data awal **dari komputer Anda** (sekali saja — Vercel tidak menjalankan ini):

```bash
# di .env lokal: TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (ganti DATABASE_URL lama)
npx prisma db push
npx prisma db seed
```

**3b. Upload gambar → Vercel Blob:**

```bash
npm install @vercel/blob
```

Ubah `src/app/api/upload/route.ts` — tulis ke Blob dan kembalikan URL:

```ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const kind = String(formData.get("kind") || "image");
  // ...validasi tipe & ukuran seperti sebelumnya (JPG/PNG/WebP/GIF, maks 5MB)...

  const blob = await put(
    kind === "ktp" ? `ktp/${file.name}` : `uploads/${file.name}`,
    file,
    { access: "public" }
  );
  return NextResponse.json({ url: blob.url });
}
```

> **Penting — privasi foto KTP di Vercel:** URL Vercel Blob bersifat publik (berisi token acak
> yang sulit ditebak, tapi siapa pun yang mendapat URL bisa membukanya). Untuk menjaga foto KTP
> tetap privat di Vercel, gunakan layanan dengan *signed URL* (mis. Cloudinary/Cloudflare R2
> bucket privat) atau pilih opsi VPS (Bagian 3). **Saran kami untuk website RT: pakai VPS
> (Bagian 3) jika privasi KTP adalah prioritas utama.**

### Langkah 4 — Isi Environment Variables di Vercel

**vercel.com → Project → Settings → Environment Variables** (Production/Preview/Development):

| Variabel | Nilai |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://nama-db.turso.io` |
| `TURSO_AUTH_TOKEN` | token dari Turso |
| `BLOB_READ_WRITE_TOKEN` | (otomatis dari Vercel Blob) |
| `NEXTAUTH_SECRET` | acak: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://nama-proyek.vercel.app` |
| `FIREBASE_DATABASE_URL` / `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | opsional (sinkronisasi online) |

### Langkah 5 — Deploy & verifikasi

Klik **Deploy**. Setiap `git push` otomatis membuat deployment baru.

Cek setelah jadi:
- [ ] Beranda, artikel, profil tampil
- [ ] Login admin & registrasi warga berhasil
- [ ] Upload gambar (artikel, bukti transaksi) tersimpan & tampil
- [ ] Admin → Sinkronisasi Firebase → **Kirim Semua Data**
- [ ] Akses `/private/`, `.env`, `dev.db` → **404**

### Biaya opsi ini: **Rp 0/bulan** (dalam batas kuota gratis, sangat cukup untuk RT).

---

## 3. 🥉 Alternatif tanpa ubah kode: VPS gratis

Aplikasi ini berjalan **apa adanya** (SQLite + upload lokal) di server dengan disk permanen.
Dua kandidat VPS gratis:

### GCP e2-micro (paling aman dari reclaim)
- Gratis selamanya: 1 VM `e2-micro` (1 GB RAM) di region tertentu, disk 30 GB, egress 1 GB/bulan.
- Butuh kartu kredit saat daftar (tidak ditagih selama dalam kuota).
- Tidak ada kebijakan *reclaim* instance idle.

### Oracle Cloud Always Free (lebih besar, tapi berisiko)
- Gratis: VM ARM Ampere hingga **2 OCPU / 12 GB RAM** (per Juni 2026).
- ⚠️ **Risiko besar:** Oracle **menonaktifkan otomatis** instance yang dianggap *idle*
  (CPU rendah ±7 hari). Website RT dengan traffic kecil **sangat rentan** — tidak disarankan
  untuk situs yang ingin selalu online.

### Setup dasar VPS (GCP maupun Oracle)

```bash
# 1. Masuk via SSH, install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 2. Clone & install
git clone https://github.com/USERNAME/nama-repo.git /var/www/rt && cd /var/www/rt
npm install
cp .env.production .env    # isi NEXTAUTH_SECRET, NEXTAUTH_URL, Firebase, dsb.
npm run db:setup           # buat database SQLite + seed

# 3. Jalankan dengan PM2 (auto-restart saat reboot)
sudo npm install -g pm2
npm run build
pm2 start "npm start" --name rt --cwd /var/www/rt
pm2 save && pm2 startup

# 4. Reverse proxy nginx + HTTPS gratis (Let's Encrypt)
sudo apt-get install -y nginx
# buat config nginx: proxy_pass http://127.0.0.1:3000;
sudo certbot --nginx -d rt.example.com   # sertifikat SSL gratis
```

**Backup otomatis:** karena Firebase RTDB sudah menyimpan salinan data, tambahkan cron
`pm2`/`crontab` untuk menjalankan `node prisma/backup.js` atau gunakan panel
**Admin → Sinkronisasi Firebase → Kirim Semua Data** secara berkala.

### Biaya opsi ini: **Rp 0/bulan** (di luar domain; butuh kemampuan admin Linux).

---

## 4. 🥈 Cloudflare Pages + D1 + R2 (untuk yang sudah di ekosistem Cloudflare)

- **Cloudflare Pages** gratis: bandwidth tak terbatas, 500 build/bulan.
- **D1** (SQLite serverless): gratis 5 GB storage, 5 juta baris baca/hari — kompatibel dengan
  Prisma via adapter `@prisma/adapter-d1`.
- **R2** (object storage): gratis 10 GB storage + 10 juta baca/bulan → cocok untuk upload
  gambar, termasuk KTP (bisa pakai *signed URL* untuk privasi).
- **Kekurangan:** Next.js App Router (server actions) perlu dibangun lewat
  `@opennextjs/cloudflare` — migrasi lebih besar dari opsi Vercel.

---

## 5. Tips agar tetap lancar & aman (semua opsi)

1. **Jangan pernah** commit `.env` / `*.db` / `private/` (sudah di `.gitignore`).
2. `NEXTAUTH_SECRET` acak & sama di semua environment.
3. Kunci **rules Firebase** agar publik tidak bisa baca/tulis langsung:
   ```json
   { "rules": { ".read": false, ".write": false } }
   ```
   (Admin SDK tetap bekerja walau rules dikunci.)
4. Backup rutin: panel **Admin → Sinkronisasi Firebase → Kirim Semua Data** = cadangan online.
5. Aktifkan **Deployment Protection** (Vercel) agar URL preview tidak terbuka untuk umum.
6. Pantau kuota gratis lewat dashboard masing-masing (Vercel, Turso, Blob, Firebase).

---

## 6. Kesimpulan

| Kebutuhan | Pilih |
|---|---|
| Gratis + paling lancar + tidak urus server | 🥇 **Vercel + Turso + Blob** |
| Privasi KTP maksimal + tanpa ubah kode | 🥉 **VPS (GCP e2-micro)** |
| Sudah pakai Cloudflare | 🥈 **Cloudflare Pages + D1 + R2** |

Semua opsi di atas gratis. Langkah migrasi kode (Bagian 2, Langkah 3) bisa dikerjakan oleh
asisten — cukup minta **"migrasikan database ke Turso dan upload ke Vercel Blob"**.
