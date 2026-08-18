import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("warga123", 10);

  // Admin + demo warga
  const admin = await prisma.user.upsert({
    where: { email: "admin@rt.com" },
    update: {},
    create: {
      email: "admin@rt.com",
      password: adminPassword,
      role: "admin",
      name: "Admin RT",
      status: "active",
    },
  });

  await prisma.user.upsert({
    where: { email: "warga@example.com" },
    update: {},
    create: {
      email: "warga@example.com",
      password: userPassword,
      role: "user",
      name: "Budi Santoso",
      nik: "3175011508900001",
      placeOfBirth: "Jakarta",
      dateOfBirth: new Date("1990-08-15T00:00:00"),
      gender: "Laki-laki",
      address: "Jl. Melati No. 12",
      rtRw: "005/003",
      kelurahan: "Kebon Jeruk",
      kecamatan: "Kebon Jeruk",
      city: "Jakarta Barat",
      province: "DKI Jakarta",
      postalCode: "11530",
      religion: "Islam",
      maritalStatus: "Kawin",
      occupation: "Karyawan Swasta",
      nationality: "WNI",
      phone: "081234567890",
      status: "active",
    },
  });

  // Default profile settings
  const profile = {
    namaRT: "RT 05 / RW 03",
    alamat: "Jl. Melati No. 12, Kebon Jeruk",
    kelurahan: "Kebon Jeruk",
    kecamatan: "Kebon Jeruk",
    kota: "Jakarta Barat",
    provinsi: "DKI Jakarta",
    kodePos: "11530",
    telepon: "0812-3456-7890",
    email: "rt05.kebonjeruk@gmail.com",
    logo: "",
    deskripsi:
      "RT 05 / RW 03 adalah wadah musyawarah dan gotong royong warga dalam membangun lingkungan yang aman, nyaman, dan rukun. Website ini menjadi media informasi dan transparansi kegiatan serta keuangan RT.",
    visi: "Terwujudnya lingkungan RT yang aman, nyaman, rukun, dan sejahtera melalui gotong royong seluruh warga.",
    misi:
      "1. Meningkatkan kebersamaan dan kepedulian sosial antarwarga\n2. Menyelenggarakan kegiatan yang bermanfaat bagi warga\n3. Menjaga keamanan dan ketertiban lingkungan\n4. Mengelola keuangan RT secara transparan dan akuntabel",
    ketuaName: "Bapak H. Ahmad Fauzi",
    bendaharaName: "Ibu Siti Rahmawati",
  };
  await prisma.setting.upsert({
    where: { key: "profile" },
    update: { value: JSON.stringify(profile) },
    create: { key: "profile", value: JSON.stringify(profile) },
  });

  // Finance categories
  const categories = [
    { name: "Iuran Warga", type: "pemasukan", sort: 1 },
    { name: "Sumbangan / Donasi", type: "pemasukan", sort: 2 },
    { name: "Dana Desa / Kelurahan", type: "pemasukan", sort: 3 },
    { name: "Lain-lain (Pemasukan)", type: "pemasukan", sort: 4 },
    { name: "Kegiatan RT", type: "pengeluaran", sort: 1 },
    { name: "Operasional", type: "pengeluaran", sort: 2 },
    { name: "Perawatan Fasilitas", type: "pengeluaran", sort: 3 },
    { name: "Sosial & Bantuan", type: "pengeluaran", sort: 4 },
    { name: "Lain-lain (Pengeluaran)", type: "pengeluaran", sort: 5 },
  ];
  for (const c of categories) {
    await prisma.financeCategory.upsert({
      where: { id: `${c.type}-${c.name}` },
      update: {},
      create: { id: `${c.type}-${c.name}`, ...c },
    });
  }

  // Org structure
  const members = [
    { group: "Pengurus Inti", position: "Ketua RT", name: "H. Ahmad Fauzi", phone: "0812-1111-2222", sort: 1 },
    { group: "Pengurus Inti", position: "Wakil Ketua", name: "Drs. Bambang Priyono", phone: "0813-3333-4444", sort: 2 },
    { group: "Pengurus Inti", position: "Sekretaris", name: "Dewi Lestari, S.E.", phone: "0821-5555-6666", sort: 3 },
    { group: "Pengurus Inti", position: "Bendahara", name: "Siti Rahmawati", phone: "0856-7777-8888", sort: 4 },
    { group: "Seksi Keamanan", position: "Koordinator Keamanan", name: "Joko Susilo", phone: "0819-9999-0000", sort: 1 },
    { group: "Seksi Kebersihan & Lingkungan", position: "Koordinator Kebersihan", name: "Agus Salim", phone: "0812-2222-3333", sort: 1 },
    { group: "Seksi Sosial & Kesehatan", position: "Koordinator Sosial", name: "Ratna Sari Dewi", phone: "0857-4444-5555", sort: 1 },
    { group: "Seksi Keagamaan", position: "Koordinator Keagamaan", name: "Ustadz Muhammad Rizal", phone: "0813-6666-7777", sort: 1 },
  ];
  for (const m of members) {
    const existing = await prisma.orgMember.findFirst({ where: { name: m.name } });
    if (!existing) {
      await prisma.orgMember.create({ data: m });
    }
  }

  // Sample articles
  const sampleArticles = [
    {
      title: "Selamat Datang di Website RT 05 / RW 03",
      category: "Pengumuman",
      excerpt: "Website resmi RT 05 / RW 03 hadir sebagai media informasi dan transparansi bagi seluruh warga.",
      content:
        "Assalamu'alaikum warahmatullahi wabarakatuh.\n\nAlhamdulillah, website resmi RT 05 / RW 03 kini telah hadir. Website ini dibuat sebagai **media informasi, komunikasi, dan transparansi** bagi seluruh warga.\n\n## Apa saja yang ada di website ini?\n\n- **Artikel & Pengumuman** — informasi kegiatan dan pengumuman terbaru dari pengurus RT.\n- **Laporan Keuangan** — transparansi kas RT yang dapat diakses oleh warga terdaftar.\n- **Profil & Struktur** — profil RT beserta susunan pengurus.\n\nWarga yang ingin mengakses laporan keuangan silakan melakukan **registrasi** menggunakan data sesuai KTP melalui menu *Daftar*.\n\nTerima kasih atas dukungan seluruh warga. Mari kita jaga kebersamaan dan gotong royong di lingkungan kita.",
    },
    {
      title: "Jadwal Kerja Bakti Bulan Ini",
      category: "Kegiatan",
      excerpt: "Kerja bakti membersihkan lingkungan akan dilaksanakan pada Minggu pertama setiap bulan.",
      content:
        "Diberitahukan kepada seluruh warga RT 05 / RW 03, bahwa **kerja bakti bulanan** akan dilaksanakan pada:\n\n- **Hari:** Minggu\n- **Tanggal:** Minggu pertama setiap bulan\n- **Waktu:** Pukul 07.00 WIB\n- **Lokasi:** Titik kumpul di depan Pos Ronda\n\n## Yang perlu dibawa\n\n1. Peralatan kebersihan (sapu lidi, cangkul, dll)\n2. Masker dan sarung tangan\n3. Semangat gotong royong!\n\nPartisipasi seluruh warga sangat kami harapkan. Terima kasih.",
    },
    {
      title: "Pemberitahuan Iuran Warga Bulan Ini",
      category: "Keuangan",
      excerpt: "Pembayaran iuran warga dapat dilakukan melalui bendahara atau transfer ke rekening kas RT.",
      content:
        "Kepada seluruh warga RT 05 / RW 03, diinformasikan bahwa **iuran warga bulanan** sebesar **Rp50.000 per Kepala Keluarga** dapat dibayarkan mulai tanggal 1 hingga 10 setiap bulannya.\n\n## Cara pembayaran\n\n1. **Tunai** — kepada Ibu Bendahara (Siti Rahmawati)\n2. **Transfer** — ke rekening kas RT (nomor rekening dapat ditanyakan kepada bendahara)\n\nSetiap pembayaran akan dicatatkan dan **bukti transaksi** ditampilkan pada laporan keuangan yang dapat diakses warga melalui website ini.\n\nTransparansi keuangan adalah komitmen kami. Mari saling mengingatkan untuk tertib membayar iuran.",
    },
  ];
  for (const a of sampleArticles) {
    const slug = a.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const exists = await prisma.article.findUnique({ where: { slug } });
    if (!exists) {
      await prisma.article.create({
        data: { ...a, slug, status: "published", authorId: admin.id },
      });
    }
  }

  console.log("✅ Seed selesai. Akun demo:");
  console.log("   Admin : admin@rt.com / admin123");
  console.log("   Warga : warga@example.com / warga123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
