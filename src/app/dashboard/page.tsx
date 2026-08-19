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
  IconPencil,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [user, articles, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { familyMembers: { orderBy: { createdAt: "asc" } } },
    }),
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
    ["Alamat Domisili", user.address || "—"],
    ["Blok", user.domicileBlock || "—"],
    ["No. Rumah", user.domicileNumber || "—"],
    ["Agama", user.religion || "—"],
    ["Status Perkawinan", user.maritalStatus || "—"],
    ["Pekerjaan", user.occupation || "—"],
    ["KTP Sukajaya", user.hasKTPSukajaya === "ya" ? "Ya" : "Belum"],
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
        <div className="flex items-center gap-2 self-start">
          <span className="badge bg-emerald-100 text-emerald-700 px-3 py-1.5">
            {session.user.role === "admin" ? "Admin" : "Kepala Keluarga"}
          </span>
          {user.profileVisibility === "private" && (
            <span className="badge bg-amber-100 text-amber-700 px-3 py-1.5">
              Profil Privat
            </span>
          )}
        </div>
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
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Data Diri (sesuai KTP)</h2>
            <Link href={`/warga/${user.id}`} className="btn btn-secondary btn-sm">
              <IconPencil className="w-3.5 h-3.5" />
              Lihat
            </Link>
          </div>
          <dl className="mt-5 divide-y divide-slate-100">
            {infoRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-slate-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Anggota KK + Artikel */}
        <div className="space-y-6">
          {/* Anggota KK */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">
                Anggota KK ({user.familyMembers.length} orang)
              </h2>
            </div>
            {user.familyMembers.length > 0 ? (
              <div className="space-y-2">
                {user.familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        m.isDeceased
                          ? "bg-slate-200 text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          m.isDeceased ? "text-slate-400 line-through" : "text-slate-800"
                        }`}>
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-400">{m.status}</p>
                      </div>
                    </div>
                    {m.isDeceased && (
                      <span className="badge bg-red-100 text-red-600 text-xs">Meninggal</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Belum ada anggota KK yang didaftarkan.</p>
            )}
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
    </div>
  );
}
