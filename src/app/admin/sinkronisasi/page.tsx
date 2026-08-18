import SyncPanel from "@/components/SyncPanel";
import { IconInfo } from "@/components/icons";
import { firebaseStatus } from "@/lib/sync";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminSyncPage() {
  const status = firebaseStatus();

  const [users, articles, txns, cats, members, lastSyncSetting] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.transaction.count(),
    prisma.financeCategory.count(),
    prisma.orgMember.count(),
    prisma.setting.findUnique({ where: { key: "lastSync" } }),
  ]);

  let lastSync: { at: string; by: string; mode: string } | null = null;
  if (lastSyncSetting) {
    try {
      lastSync = JSON.parse(lastSyncSetting.value);
    } catch {
      lastSync = null;
    }
  }

  const localCounts = [
    { label: "Warga / Akun", value: users },
    { label: "Artikel", value: articles },
    { label: "Transaksi", value: txns },
    { label: "Kategori Keuangan", value: cats },
    { label: "Struktur Organisasi", value: members },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Sinkronisasi Firebase</h1>
      <p className="mt-1 text-slate-500 mb-4">
        Simpan data secara lokal (SQLite) sekaligus online di Firebase Realtime Database.
      </p>

      <div className="card mb-5 p-5">
        <h2 className="font-bold text-slate-900 mb-3">Data di database lokal</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {localCounts.map((c) => (
            <div key={c.label} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-xl font-extrabold text-slate-900">{c.value}</p>
              <p className="text-xs text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
          <IconInfo className="w-4 h-4 mt-0.5 shrink-0" />
          Setiap perubahan (artikel, transaksi, warga, dll.) otomatis dikirim ke Firebase begitu
          kredensial diisi. Tombol di bawah untuk backup/restore penuh.
        </p>
      </div>

      <SyncPanel
        configured={status.configured}
        databaseURL={status.databaseURL}
        lastSync={lastSync}
      />
    </div>
  );
}
