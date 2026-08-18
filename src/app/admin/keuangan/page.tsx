import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatRupiah, monthNameId } from "@/lib/utils";
import { deleteTransaction } from "@/actions/finance";
import TransactionAddPanel from "@/components/TransactionAddPanel";
import ConfirmAction from "@/components/ConfirmAction";
import { IconEye, IconPencil } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminKeuanganPage({
  searchParams,
}: {
  searchParams: { bulan?: string; tahun?: string; tipe?: string };
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const bulan = Math.min(12, Math.max(0, parseInt(searchParams.bulan || String(now.getMonth() + 1), 10) || 0));
  const tahun = Math.min(currentYear + 5, Math.max(currentYear - 5, parseInt(searchParams.tahun || String(currentYear), 10) || currentYear));
  const tipe = searchParams.tipe || "";

  const range =
    bulan === 0
      ? { gte: new Date(tahun, 0, 1), lte: new Date(tahun, 11, 31, 23, 59, 59) }
      : { gte: new Date(tahun, bulan - 1, 1), lte: new Date(tahun, bulan, 0, 23, 59, 59) };

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: range, ...(tipe ? { type: tipe } : {}) },
      include: { category: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.financeCategory.findMany({ orderBy: [{ type: "asc" }, { sort: "asc" }] }),
  ]);

  const totalIn = transactions.filter((t) => t.type === "pemasukan").reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter((t) => t.type === "pengeluaran").reduce((s, t) => s + t.amount, 0);
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Keuangan</h1>
          <p className="mt-1 text-slate-500">
            Pemasukan {formatRupiah(totalIn)} · Pengeluaran {formatRupiah(totalOut)} · Saldo{" "}
            <span className="font-semibold">{formatRupiah(totalIn - totalOut)}</span>
          </p>
        </div>
        <Link href="/admin/keuangan/kategori" className="btn btn-secondary self-start">
          Kelola Kategori
        </Link>
      </div>

      <form method="GET" className="mt-4 flex flex-wrap gap-3">
        <div>
          <label className="label">Bulan</label>
          <select name="bulan" defaultValue={bulan} className="input sm:w-40">
            <option value="0">Semua Bulan</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {monthNameId(m)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Tahun</label>
          <select name="tahun" defaultValue={tahun} className="input sm:w-28">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Jenis</label>
          <select name="tipe" defaultValue={tipe} className="input sm:w-40">
            <option value="">Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <div className="flex gap-2 self-end">
          <button type="submit" className="btn btn-primary">
            Tampilkan
          </button>
          <a href="/admin/keuangan" className="btn btn-secondary">
            Reset
          </a>
        </div>
      </form>

      <div className="mt-5">
        <TransactionAddPanel categories={categories} />
      </div>

      <div className="card mt-5 overflow-hidden">
        {transactions.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">Belum ada transaksi pada periode ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th">Keterangan</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th text-right">Pemasukan</th>
                  <th className="table-th text-right">Pengeluaran</th>
                  <th className="table-th">Bukti</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50">
                    <td className="table-td whitespace-nowrap">{formatDate(t.date)}</td>
                    <td className="table-td">{t.description || "—"}</td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          t.type === "pemasukan"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.category.name}
                      </span>
                    </td>
                    <td className="table-td text-right font-semibold text-emerald-700">
                      {t.type === "pemasukan" ? formatRupiah(t.amount) : "—"}
                    </td>
                    <td className="table-td text-right font-semibold text-red-600">
                      {t.type === "pengeluaran" ? formatRupiah(t.amount) : "—"}
                    </td>
                    <td className="table-td">
                      {t.proofImage ? (
                        <a
                          href={t.proofImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <IconEye className="w-4 h-4" />
                          Lihat
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/keuangan/${t.id}/edit`}
                          className="btn btn-secondary btn-sm"
                        >
                          <IconPencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <ConfirmAction
                          action={deleteTransaction.bind(null, t.id)}
                          label="Hapus"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
