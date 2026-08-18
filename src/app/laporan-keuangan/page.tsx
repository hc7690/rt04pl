import { prisma } from "@/lib/prisma";
import { formatDate, formatRupiah, getProfile, getSignatures, monthNameId } from "@/lib/utils";
import PrintButton from "@/components/PrintButton";
import { IconAlert, IconEye } from "@/components/icons";

export const dynamic = "force-dynamic";

type SearchParams = { bulan?: string; tahun?: string; tipe?: string };

export default async function LaporanKeuanganPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [profile, signatures] = await Promise.all([getProfile(), getSignatures()]);
  const now = new Date();
  const currentYear = now.getFullYear();

  const bulan = Math.min(12, Math.max(0, parseInt(searchParams.bulan || String(now.getMonth() + 1), 10) || 0));
  const tahun = Math.min(currentYear + 5, Math.max(currentYear - 5, parseInt(searchParams.tahun || String(currentYear), 10) || currentYear));
  const tipe = searchParams.tipe || "";

  const yearStart = new Date(tahun, 0, 1);
  const yearEnd = new Date(tahun, 11, 31, 23, 59, 59);
  const monthStart = new Date(tahun, bulan - 1, 1);
  const monthEnd = new Date(tahun, bulan, 0, 23, 59, 59);
  const range = bulan === 0 ? { gte: yearStart, lte: yearEnd } : { gte: monthStart, lte: monthEnd };

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: { date: range, ...(tipe ? { type: tipe } : {}) },
      include: { category: true },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.financeCategory.findMany({ orderBy: [{ type: "asc" }, { sort: "asc" }] }),
  ]);

  const pemasukan = transactions
    .filter((t) => t.type === "pemasukan")
    .reduce((sum, t) => sum + t.amount, 0);
  const pengeluaran = transactions
    .filter((t) => t.type === "pengeluaran")
    .reduce((sum, t) => sum + t.amount, 0);
  const saldo = pemasukan - pengeluaran;

  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Filter (tidak ikut tercetak) */}
      <div className="no-print mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Laporan Keuangan</h1>
            <p className="mt-1 text-slate-500">Transparansi kas {profile.namaRT} — tersedia untuk warga terdaftar.</p>
          </div>
          <PrintButton />
        </div>
        <form method="GET" className="mt-4 flex flex-wrap gap-3">
          <div>
            <label className="label">Bulan</label>
            <select name="bulan" defaultValue={bulan} className="input sm:w-44">
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
            <select name="tahun" defaultValue={tahun} className="input sm:w-32">
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Jenis</label>
            <select name="tipe" defaultValue={tipe} className="input sm:w-44">
              <option value="">Semua Transaksi</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary self-end">
              Tampilkan
            </button>
            <a href="/laporan-keuangan" className="btn btn-secondary self-end">
              Reset
            </a>
          </div>
        </form>
      </div>

      {/* Area cetak */}
      <div className="print-area print-full">
        <div className="card overflow-hidden">
          {/* Kop laporan */}
          <div className="border-b border-slate-200 px-6 sm:px-8 py-6 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              LAPORAN KEUANGAN {profile.namaRT.toUpperCase()}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {profile.alamat}, {profile.kelurahan}, {profile.kecamatan}, {profile.kota}, {profile.provinsi}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-700">
              Periode: {bulan === 0 ? `Tahun ${tahun}` : `${monthNameId(bulan)} ${tahun}`}
            </p>
          </div>

          {/* Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 sm:px-8 py-6">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Total Pemasukan</p>
              <p className="mt-1 text-xl sm:text-2xl font-extrabold text-emerald-700">{formatRupiah(pemasukan)}</p>
              <p className="mt-0.5 text-xs text-emerald-600">{transactions.filter((t) => t.type === "pemasukan").length} transaksi</p>
            </div>
            <div className="rounded-xl bg-red-50 border border-red-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Total Pengeluaran</p>
              <p className="mt-1 text-xl sm:text-2xl font-extrabold text-red-600">{formatRupiah(pengeluaran)}</p>
              <p className="mt-0.5 text-xs text-red-500">{transactions.filter((t) => t.type === "pengeluaran").length} transaksi</p>
            </div>
            <div className="rounded-xl bg-slate-800 p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Saldo Kas</p>
              <p className="mt-1 text-xl sm:text-2xl font-extrabold">{formatRupiah(saldo)}</p>
              <p className="mt-0.5 text-xs text-slate-400">Pemasukan − Pengeluaran</p>
            </div>
          </div>

          {/* Tabel transaksi */}
          {transactions.length === 0 ? (
            <div className="px-6 sm:px-8 pb-8">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-10 text-sm text-slate-500">
                <IconAlert className="w-5 h-5" />
                Belum ada transaksi pada periode ini.
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="table-th w-10">No</th>
                    <th className="table-th">Tanggal</th>
                    <th className="table-th">Keterangan</th>
                    <th className="table-th">Kategori</th>
                    <th className="table-th text-right">Pemasukan</th>
                    <th className="table-th text-right">Pengeluaran</th>
                    <th className="table-th no-print">Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="table-td text-slate-400">{i + 1}</td>
                      <td className="table-td whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="table-td">{t.description || "—"}</td>
                      <td className="table-td">
                        <span
                          className={`badge ${
                            t.type === "pemasukan" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
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
                      <td className="table-td no-print">
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
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td className="table-td" colSpan={4}>
                      Total {tipe ? (tipe === "pemasukan" ? "Pemasukan" : "Pengeluaran") : ""}
                    </td>
                    <td className="table-td text-right text-emerald-700">{formatRupiah(pemasukan)}</td>
                    <td className="table-td text-right text-red-600">{formatRupiah(pengeluaran)}</td>
                    <td className="table-td no-print" />
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Rincian per kategori + tanda tangan */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="card print-full p-6">
            <h3 className="font-bold text-slate-900 mb-4">Rekap per Kategori</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="table-th">Kategori</th>
                  <th className="table-th text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => {
                  const total = transactions
                    .filter((t) => t.categoryId === c.id)
                    .reduce((sum, t) => sum + t.amount, 0);
                  if (total === 0) return null;
                  return (
                    <tr key={c.id}>
                      <td className="table-td">
                        <span className={`badge ${c.type === "pemasukan" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {c.type === "pemasukan" ? "Masuk" : "Keluar"}
                        </span>{" "}
                        {c.name}
                      </td>
                      <td className="table-td text-right font-semibold">{formatRupiah(total)}</td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr>
                    <td className="table-td text-slate-400" colSpan={2}>
                      Belum ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="card print-full p-6">
            <h3 className="font-bold text-slate-900 mb-8">Mengetahui,</h3>
            <div className="flex justify-around gap-6 text-center text-sm">
              {/* Bendahara */}
              <div className="flex-1">
                <p className="text-slate-500">Bendahara</p>
                {signatures.bendahara ? (
                  <div className="mt-2 flex h-24 items-end justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signatures.bendahara}
                      alt="Tanda tangan bendahara"
                      className="max-h-20 object-contain"
                    />
                  </div>
                ) : (
                  <div className="mt-16" />
                )}
                <div className="mt-2 border-t border-slate-400 pt-2 font-bold text-slate-900">
                  {profile.bendaharaName || "......................"}
                </div>
              </div>

              {/* Ketua RT + stempel menimpa di sisi kanan */}
              <div className="flex-1">
                <p className="text-slate-500">Ketua RT</p>
                {signatures.ketua || signatures.stamp ? (
                  <div className="relative mt-2 inline-flex h-24 items-end justify-center">
                    {signatures.ketua && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signatures.ketua}
                        alt="Tanda tangan ketua"
                        className="max-h-20 object-contain"
                      />
                    )}
                    {signatures.stamp && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={signatures.stamp}
                        alt="Stempel RT"
                        className="absolute -right-6 -top-4 h-24 w-24 object-contain opacity-80 mix-blend-multiply -rotate-6"
                      />
                    )}
                  </div>
                ) : (
                  <div className="mt-16" />
                )}
                <div className="mt-2 border-t border-slate-400 pt-2 font-bold text-slate-900">
                  {profile.ketuaName || "......................"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
