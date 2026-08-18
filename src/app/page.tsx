import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/utils";
import ArticleCard from "@/components/ArticleCard";
import {
  IconArrowRight,
  IconBuilding,
  IconDocument,
  IconHeart,
  IconMegaphone,
  IconShield,
  IconUsers,
  IconWallet,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [profile, session, articles, wargaCount, articleCount] = await Promise.all([
    getProfile(),
    getServerSession(authOptions),
    prisma.article.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.user.count({ where: { role: "user", status: "active" } }),
    prisma.article.count({ where: { status: "published" } }),
  ]);

  const stats = [
    { icon: <IconUsers className="w-5 h-5" />, label: "Warga Terdaftar", value: wargaCount },
    { icon: <IconDocument className="w-5 h-5" />, label: "Artikel & Pengumuman", value: articleCount },
    { icon: <IconWallet className="w-5 h-5" />, label: "Transparansi Kas", value: "100%" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <span className="badge bg-white/15 text-white mb-4">Selamat datang di</span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight">{profile.namaRT}</h1>
            <p className="mt-4 text-emerald-50/90 leading-relaxed">
              {profile.deskripsi}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/artikel" className="btn bg-white text-emerald-700 hover:bg-emerald-50">
                <IconMegaphone className="w-4 h-4" />
                Baca Artikel &amp; Pengumuman
              </Link>
              <Link
                href="/profil/struktur"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                <IconBuilding className="w-4 h-4" />
                Struktur Organisasi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="card flex items-center gap-4 p-5 shadow-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                {s.icon}
              </span>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest articles */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Artikel Terbaru</h2>
            <p className="text-sm text-slate-500 mt-1">Informasi dan pengumuman terbaru dari pengurus RT</p>
          </div>
          <Link href="/artikel" className="btn btn-secondary btn-sm shrink-0">
            Semua Artikel
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">Belum ada artikel.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </section>

      {/* Visi Misi + finance CTA */}
      <section className="bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Visi &amp; Misi</h2>
              <div className="space-y-4">
                <div className="card p-5 border-l-4 border-l-emerald-500">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <IconShield className="w-5 h-5 text-emerald-600" />
                    Visi
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{profile.visi}</p>
                </div>
                <div className="card p-5 border-l-4 border-l-teal-500">
                  <h3 className="flex items-center gap-2 font-bold text-slate-900">
                    <IconHeart className="w-5 h-5 text-teal-600" />
                    Misi
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {profile.misi}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Keuangan RT yang Transparan</h2>
              <div className="card p-6 sm:p-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <IconWallet className="w-6 h-6" />
                  </span>
                  <h3 className="font-bold text-slate-900">Laporan Kas &amp; Keuangan</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Setiap pemasukan dan pengeluaran kas RT dicatat lengkap beserta bukti transaksi.
                  Warga terdaftar dapat melihat laporan bulanan dan mencetaknya dalam bentuk PDF.
                </p>
                <div className="mt-6">
                  {session?.user ? (
                    <Link href="/laporan-keuangan" className="btn btn-primary">
                      <IconWallet className="w-4 h-4" />
                      Lihat Laporan Keuangan
                    </Link>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <Link href="/daftar" className="btn btn-primary">
                        Daftar sebagai Warga
                      </Link>
                      <Link href="/login" className="btn btn-secondary">
                        Masuk
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
