"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile, type ProfileInput } from "@/actions/settings";
import ImageUpload from "./ImageUpload";
import { IconAlert } from "./icons";

export default function ProfileForm({ initial }: { initial: ProfileInput }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileInput>(initial);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await saveProfile(form);
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
        <div className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Profil RT berhasil disimpan. ✓
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Nama RT <span className="text-red-500">*</span></label>
          <input className="input" required value={form.namaRT} onChange={(e) => set("namaRT", e.target.value)} />
        </div>
        <div>
          <label className="label">Alamat</label>
          <input className="input" value={form.alamat} onChange={(e) => set("alamat", e.target.value)} />
        </div>
        <div>
          <label className="label">Kelurahan / Desa</label>
          <input className="input" value={form.kelurahan} onChange={(e) => set("kelurahan", e.target.value)} />
        </div>
        <div>
          <label className="label">Kecamatan</label>
          <input className="input" value={form.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} />
        </div>
        <div>
          <label className="label">Kota / Kabupaten</label>
          <input className="input" value={form.kota} onChange={(e) => set("kota", e.target.value)} />
        </div>
        <div>
          <label className="label">Provinsi</label>
          <input className="input" value={form.provinsi} onChange={(e) => set("provinsi", e.target.value)} />
        </div>
        <div>
          <label className="label">Kode Pos</label>
          <input className="input" value={form.kodePos} onChange={(e) => set("kodePos", e.target.value)} />
        </div>
        <div>
          <label className="label">Telepon</label>
          <input className="input" value={form.telepon} onChange={(e) => set("telepon", e.target.value)} />
        </div>
        <div>
          <label className="label">Email RT</label>
          <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Deskripsi RT</label>
          <textarea
            className="input resize-y"
            rows={3}
            value={form.deskripsi}
            onChange={(e) => set("deskripsi", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Visi</label>
          <textarea
            className="input resize-y"
            rows={3}
            value={form.visi}
            onChange={(e) => set("visi", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Misi</label>
          <textarea
            className="input resize-y"
            rows={3}
            value={form.misi}
            onChange={(e) => set("misi", e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <ImageUpload label="Logo RT" value={form.logo} onChange={(url) => set("logo", url)} aspect="square" />
        </div>
        <div>
          <label className="label">Nama Ketua RT (untuk tanda tangan laporan)</label>
          <input className="input" value={form.ketuaName} onChange={(e) => set("ketuaName", e.target.value)} />
        </div>
        <div>
          <label className="label">Nama Bendahara (untuk tanda tangan laporan)</label>
          <input className="input" value={form.bendaharaName} onChange={(e) => set("bendaharaName", e.target.value)} />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {loading ? "Menyimpan…" : "Simpan Profil RT"}
        </button>
      </div>
    </form>
  );
}
