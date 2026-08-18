"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pullAllData, pushAllData } from "@/actions/sync";
import type { SyncResult } from "@/lib/sync";
import { IconAlert, IconCheckCircle, IconCloud, IconUpload } from "./icons";

const LABELS: Record<string, string> = {
  users: "Warga / Akun",
  articles: "Artikel",
  transactions: "Transaksi",
  categories: "Kategori Keuangan",
  orgMembers: "Struktur Organisasi",
  settings: "Pengaturan",
};

export default function SyncPanel({
  configured,
  databaseURL,
  lastSync,
}: {
  configured: boolean;
  databaseURL: string;
  lastSync: { at: string; by: string; mode: string } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"push" | "pull" | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function run(kind: "push" | "pull") {
    setBusy(kind);
    setResult(null);
    try {
      const r = kind === "push" ? await pushAllData() : await pullAllData();
      setResult(r);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      {!configured ? (
        <div className="card p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <IconAlert className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Firebase belum dikonfigurasi</h2>
              <p className="mt-1 text-sm text-slate-500">
                Aplikasi tetap berjalan normal dengan data lokal (SQLite). Untuk mengaktifkan
                penyimpanan online, isi 4 variabel berikut di file <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env</code>:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                <li><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">FIREBASE_DATABASE_URL</code> — dari tab Realtime Database di Firebase Console</li>
                <li><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">FIREBASE_PROJECT_ID</code> — Project settings → General</li>
                <li><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">FIREBASE_CLIENT_EMAIL</code> — dari file kunci service account</li>
                <li><code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">FIREBASE_PRIVATE_KEY</code> — dari file kunci service account</li>
              </ul>
              <p className="mt-3 text-sm text-slate-500">
                Panduan lengkap ada di <span className="font-semibold">README.md</span>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card flex items-center gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <IconCloud className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-bold text-slate-900">Terhubung ke Firebase Realtime Database</p>
              <p className="truncate text-sm text-slate-500">{databaseURL}</p>
            </div>
          </div>

          {lastSync && (
            <p className="text-sm text-slate-500">
              Sinkronisasi terakhir:{" "}
              <span className="font-semibold text-slate-700">
                {new Date(lastSync.at).toLocaleString("id-ID")}
              </span>{" "}
              oleh {lastSync.by} ({lastSync.mode === "push" ? "kirim" : "ambil"})
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900">Kirim ke Firebase</h3>
              <p className="mt-1 text-sm text-slate-500">
                Backup penuh: seluruh data lokal ditulis ulang ke Firebase (data online mengikuti data lokal).
              </p>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("push")}
                className="btn btn-primary mt-4"
              >
                {busy === "push" && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <IconUpload className="w-4 h-4" />
                {busy === "push" ? "Mengirim…" : "Kirim Semua Data ke Firebase"}
              </button>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-slate-900">Ambil dari Firebase</h3>
              <p className="mt-1 text-sm text-slate-500">
                Restore: menambahkan data dari Firebase yang belum ada di lokal. Data lokal yang sudah ada tidak ditimpa.
              </p>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => run("pull")}
                className="btn btn-secondary mt-4"
              >
                {busy === "pull" && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                <IconCloud className="w-4 h-4" />
                {busy === "pull" ? "Mengambil…" : "Ambil Data dari Firebase"}
              </button>
            </div>
          </div>
        </>
      )}

      {result && !result.ok && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {result.error}
        </div>
      )}

      {result && result.ok && (
        <div className="card p-6">
          <div className="flex items-center gap-2 font-bold text-emerald-700">
            <IconCheckCircle className="w-5 h-5" />
            {busy === "push" ? "" : "Sinkronisasi selesai."}
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="table-th">Data</th>
                  <th className="table-th text-right">{busy === "push" ? "Dikirim" : "Ditambahkan"}</th>
                  <th className="table-th text-right">Dilewati (sudah ada)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.keys(LABELS).map((key) => (
                  <tr key={key}>
                    <td className="table-td">{LABELS[key]}</td>
                    <td className="table-td text-right font-semibold text-slate-900">
                      {result.counts[key] ?? 0}
                    </td>
                    <td className="table-td text-right text-slate-400">
                      {result.skipped[key] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
