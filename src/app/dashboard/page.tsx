import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getProfile } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";
import {
  IconArrowRight,
  IconDocument,
  IconSettings,
  IconUsers,
  IconWallet,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, articles, profile] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    getProfile(),
  ]);

  if (!user) redirect("/login");

  const quickLinks = [
    { href: "/laporan-keuangan", icon: <IconWallet className="w-5 h-5" />, title: "Laporan Keuangan", desc: "Lihat kas RT & cetak PDF" },
    { href: "/artikel", icon: <IconDocument className="w-5 h-5" />, title: "Artikel & Pengumuman", desc: "Baca informasi terbaru" },
    { href: "/warga", icon: <IconUsers className="w-5 h-5" />, title: "Direktori Warga", desc: "Kenali tetangga & lihat profil" },
    ...(session.user.role === "admin"
      ? [{ href: "/admin", icon: <IconSettings className="w-5 h-5" />, title: "Panel Admin", desc: "Kelola website" }]
      : [{ href: "/profil/struktur", icon: <IconUsers className="w-5 h-5" />, title: "Struktur Organisasi", desc: "Kenali pengurus RT" }]),
  ];

  const infoRows: Array<[string, string]> = [
    ["NIK", user.nik || "—"],
    [
      "Tempat, Tanggal Lahir",
      user.dateOfBirth
        ? `${user.placeOfBirth || "—"}, ${formatDate(user.dateOfBirth)}`
        : user.placeOfBirth || "—",
    ],
    ["Jenis Kelamin", user.gender || "—"],
    ["Alamat", user.address || "—"],
    ["RT / RW", user.rtRw || "—"],
    ["Kelurahan / Kecamatan", [user.kelurahan, user.kecamatan].filter(Boolean).join(", ") || "—"],
    ["Kota / Provinsi", [user.city, user.province].filter(Boolean).join(", ") || "—"],
    ["Agama", user.religion || "—"],
    ["Status Perkawinan", user.maritalStatus || "—"],
    ["Pekerjaan", user.occupation || "—"],
    ["No. HP", user.phone || "—"],
    ["Email", user.email],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Halo, {user.name.split(" ")[0]}! 👋
          </h1>
          <p className="mt-1 text-slate-500">
            Selamat datang di dashboard warga {profile.namaRT}.
          </p>
        </div>
        <span className="badge self-start bg-emerald-100 text-emerald-700 px-3 py-1.5">
          {session.user.role === "admin" ? "Admin" : "Warga Terdaftar"}
        </span>
      </div>

      {/* Quick links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((l, i) => (
          <Link key={i} href={l.href} className="card group p-5 transition hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              {l.icon}
            </span>
            <p className="mt-3 font-bold text-slate-900 group-hover:text-emerald-700 transition">
              {l.title}
            </p>
            <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Data diri */}
        <div className="card p-6 sm:p-8">
          <h2 className="font-bold text-slate-900">Data Diri (sesuai KTP)</h2>
          <dl className="mt-5 divide-y divide-slate-100">
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-slate-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Artikel terbaru */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Artikel Terbaru</h2>
            <Link href="/artikel" className="btn btn-secondary btn-sm">
              Semua
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
            {articles.length === 0 && (
              <p className="card p-6 text-sm text-slate-500">Belum ada artikel.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
