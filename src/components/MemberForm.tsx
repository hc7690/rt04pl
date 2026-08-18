"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveMember, type ActionResult, type MemberInput } from "@/actions/struktur";
import ImageUpload from "./ImageUpload";
import { IconAlert } from "./icons";

type Props = {
  groups: string[];
  initial?: {
    id: string;
    group: string;
    position: string;
    name: string;
    photo: string;
    phone: string;
    sort: number;
    active: boolean;
  };
  submitLabel?: string;
  /** Tujuan navigasi setelah berhasil disimpan (mode edit). */
  redirectTo?: string;
  onSuccess?: () => void;
};

export default function MemberForm({ groups, initial, submitLabel = "Simpan Anggota", redirectTo, onSuccess }: Props) {
  const router = useRouter();
  const [group, setGroup] = useState(initial?.group ?? "Pengurus Inti");
  const [position, setPosition] = useState(initial?.position ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [photo, setPhoto] = useState(initial?.photo ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [sort, setSort] = useState(initial ? String(initial.sort) : "0");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const input: MemberInput = {
        id: initial?.id,
        group,
        position,
        name,
        photo,
        phone,
        sort: parseInt(sort, 10) || 0,
        active,
      };
      const result: ActionResult = await saveMember(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      if (onSuccess) onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Kelompok / Seksi <span className="text-red-500">*</span></label>
          <input
            className="input"
            list="group-list"
            required
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          />
          <datalist id="group-list">
            {groups.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label">Jabatan <span className="text-red-500">*</span></label>
          <input
            className="input"
            required
            placeholder="cth: Ketua RT, Sekretaris, Koordinator Keamanan"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Nama Lengkap <span className="text-red-500">*</span></label>
          <input
            className="input"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">No. HP (opsional)</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label className="label">Urutan Tampil</label>
          <input
            type="number"
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Tampilkan di halaman publik
          </label>
        </div>
        <div className="sm:col-span-2">
          <ImageUpload
            label="Foto (opsional)"
            value={photo}
            onChange={setPhoto}
            aspect="square"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {loading ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}
