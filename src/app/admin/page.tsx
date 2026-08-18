import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateShort, formatRupiah } from "@/lib/utils";
import {
  IconArrowRight,
  IconDocument,
  IconUsers,
  IconWallet,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [articleCount, draftCount, wargaCount, monthTxns, recentTxns, recentArticles] =
    await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: "draft" } }),
      prisma.user.count({ where: { role: "user" } }),
      prisma.transaction.findMany({ where: { date: { gte: monthStart, lte: monthEnd } } }),
      prisma.transaction.findMany({
        include: { category: true },
        orderBy: { date: "desc" },
        take: 6,
      }),
      prisma.article.findMany({
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const monthIncome = monthTxns.filter((t) => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxns.filter((t) => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);

  const stats = [
    { icon: <IconDocument className="w-5 h-5" />, label: "Total Artikel", value: articleCount, sub: `${draftCount} draft`, href: "/admin/artikel" },
    { icon: <IconWallet className="w-5 h-5" />, label: "Pemasukan Bulan Ini", value: formatRupiah(monthIncome), sub: `${monthTxns.filter((t) => t.type === "pemasukan").length} transaksi`, href: "/admin/keuangan" },
    { icon: <IconWallet className="w-5 h-5" />, label: "Pengeluaran Bulan Ini", value: formatRupiah(monthExpense), sub: `${monthTxns.filter((t) => t.type === "pengeluaran").length} transaksi`, href: "/admin/keuangan" },
    { icon: <IconUsers className="w-5 h-5" />, label: "Warga Terdaftar", value: wargaCount, sub: "akun user", href: "/admin/warga" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Admin</h1>
      <p className="mt-1 text-slate-500">Ringkasan aktivitas website RT.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Link key={i} href={s.href} className="card group p-5 transition hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              {s.icon}
            </span>
            <p className="mt-3 text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Transaksi terbaru */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Transaksi Terbaru</h2>
            <Link href="/admin/keuangan" className="btn btn-secondary btn-sm">
              Kelola
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTxns.length === 0 && (
              <p className="py-6 text-sm text-slate-400 text-center">Belum ada transaksi.</p>
            )}
            {recentTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {t.description || t.category.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDateShort(t.date)} · {t.category.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-bold ${
                    t.type === "pemasukan" ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {t.type === "pemasukan" ? "+" : "−"}
                  {formatRupiah(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Artikel terbaru */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Artikel Terbaru</h2>
            <Link href="/admin/artikel" className="btn btn-secondary btn-sm">
              Kelola
              <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentArticles.length === 0 && (
              <p className="py-6 text-sm text-slate-400 text-center">Belum ada artikel.</p>
            )}
            {recentArticles.map((a) => (
              <div key={a.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{a.title}</p>
                  <p className="text-xs text-slate-400">
                    {formatDateShort(a.createdAt)} · oleh {a.author.name}
                  </p>
                </div>
                <span
                  className={`badge shrink-0 ${
                    a.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.status === "published" ? "Terbit" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
