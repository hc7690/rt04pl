"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSignatures, type SignaturesInput } from "@/actions/settings";
import ImageUpload from "./ImageUpload";
import { IconAlert, IconCheckCircle } from "./icons";

export default function SignatureForm({ initial }: { initial: SignaturesInput }) {
  const router = useRouter();
  const [form, setForm] = useState<SignaturesInput>(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof SignaturesInput>(key: K, value: SignaturesInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await saveSignatures(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <IconCheckCircle className="w-4 h-4" />
          Tanda tangan & stempel berhasil disimpan. ✓
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <ImageUpload
            label="Tanda Tangan Ketua"
            aspect="square"
            value={form.ketua}
            onChange={(url) => set("ketua", url)}
            kind="signature"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Foto tanda tangan dengan latar putih polos agar hasil cetak rapi.
          </p>
        </div>
        <div>
          <ImageUpload
            label="Tanda Tangan Bendahara"
            aspect="square"
            value={form.bendahara}
            onChange={(url) => set("bendahara", url)}
            kind="signature"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Foto tanda tangan dengan latar putih polos agar hasil cetak rapi.
          </p>
        </div>
        <div className="sm:col-span-2">
          <ImageUpload
            label="Stempel / Cap RT (opsional)"
            aspect="square"
            value={form.stamp}
            onChange={(url) => set("stamp", url)}
            kind="stamp"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Stempel akan diletakkan di samping kanan tanda tangan Ketua, sedikit menimpa —
            seperti pada laporan asli.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {loading ? "Menyimpan…" : "Simpan Tanda Tangan & Stempel"}
        </button>
      </div>
    </form>
  );
}
