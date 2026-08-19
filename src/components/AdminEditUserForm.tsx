"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateProfile, type FamilyMemberInput } from "@/actions/profile";
import { IconAlert, IconCheck, IconPlus, IconTrash, IconPencil } from "./icons";

type UserData = {
  id: string;
  name: string;
  phone: string;
  occupation: string;
  gender: string;
  religion: string;
  maritalStatus: string;
  address: string;
  domicileBlock: string;
  domicileNumber: string;
  hasKTPSukajaya: string;
  profileVisibility: string;
  status: string;
  role: string;
};

type MemberData = {
  id?: string;
  name: string;
  status: string;
  religion: string;
  isDeceased: boolean;
};

const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"];
const STATUS_ANGGOTA = ["Suami", "Istri", "Anak", "Orang Tua", "Lainnya"];
const BLOK_OPTIONS = Array.from({ length: 16 }, (_, i) => `F-${i + 5}`);

export default function AdminEditUserForm({
  user,
  familyMembers,
}: {
  user: UserData;
  familyMembers: MemberData[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(user);
  const [members, setMembers] = useState<MemberData[]>(familyMembers);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof UserData>(key: K, value: UserData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addMember() {
    setMembers((prev) => [...prev, { name: "", status: "Anak", religion: "", isDeceased: false }]);
  }

  function updateMember(index: number, field: keyof MemberData, value: any) {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const validMembers = members.filter((m) => m.name.trim());
      const result = await adminUpdateProfile(user.id, {
        name: form.name,
        phone: form.phone,
        occupation: form.occupation,
        gender: form.gender,
        religion: form.religion,
        maritalStatus: form.maritalStatus,
        address: form.address,
        domicileBlock: form.domicileBlock,
        domicileNumber: form.domicileNumber,
        hasKTPSukajaya: form.hasKTPSukajaya,
        profileVisibility: form.profileVisibility,
        status: form.status,
        role: form.role,
        familyMembers: validMembers.map((m) => ({
          name: m.name.trim(),
          status: m.status,
          religion: m.religion || undefined,
          isDeceased: m.isDeceased,
        })),
      });

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary"
      >
        <IconPencil className="w-4 h-4" />
        Edit Data Warga
      </button>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-900">Edit Data Warga (Admin)</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-secondary btn-sm"
        >
          Tutup
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <IconCheck className="w-4 h-4 mt-0.5 shrink-0" />
          Data berhasil diperbarui!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Data Dasar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label text-xs">Nama</label>
            <input className="input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">No. HP</label>
            <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Pekerjaan</label>
            <input className="input" value={form.occupation} onChange={(e) => set("occupation", e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">Jenis Kelamin</label>
            <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
              <option value="">— Pilih —</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Agama</label>
            <select className="input" value={form.religion} onChange={(e) => set("religion", e.target.value)}>
              <option value="">— Pilih —</option>
              {AGAMA.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status Perkawinan</label>
            <select className="input" value={form.maritalStatus} onChange={(e) => set("maritalStatus", e.target.value)}>
              <option value="">— Pilih —</option>
              <option value="Belum Kawin">Belum Kawin</option>
              <option value="Kawin">Kawin</option>
              <option value="Cerai Hidup">Cerai Hidup</option>
              <option value="Cerai Mati">Cerai Mati</option>
            </select>
          </div>
        </div>

        {/* Domisili */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label text-xs">Blok Domisili</label>
            <select className="input" value={form.domicileBlock} onChange={(e) => set("domicileBlock", e.target.value)}>
              <option value="">— Pilih —</option>
              {BLOK_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">No. Rumah</label>
            <input className="input" value={form.domicileNumber} onChange={(e) => set("domicileNumber", e.target.value)} />
          </div>
          <div>
            <label className="label text-xs">KTP Sukajaya</label>
            <select className="input" value={form.hasKTPSukajaya} onChange={(e) => set("hasKTPSukajaya", e.target.value)}>
              <option value="ya">Ya</option>
              <option value="belum">Belum</option>
            </select>
          </div>
        </div>

        {/* Status & Role */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label text-xs">Status Akun</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Aktif</option>
              <option value="disabled">Nonaktif</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Peran</label>
            <select className="input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="user">Warga</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Visibilitas Profil</label>
            <select className="input" value={form.profileVisibility} onChange={(e) => set("profileVisibility", e.target.value)}>
              <option value="public">Publik</option>
              <option value="private">Privat</option>
            </select>
          </div>
        </div>

        {/* Anggota KK */}
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Anggota Kartu Keluarga</h3>
          <div className="mt-3 space-y-3">
            {members.map((member, idx) => (
              <div key={idx} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-3 bg-slate-50">
                <div className="flex-1 min-w-[180px]">
                  <label className="label text-xs">Nama</label>
                  <input
                    className="input"
                    value={member.name}
                    onChange={(e) => updateMember(idx, "name", e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="label text-xs">Status</label>
                  <select
                    className="input"
                    value={member.status}
                    onChange={(e) => updateMember(idx, "status", e.target.value)}
                  >
                    {STATUS_ANGGOTA.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-32">
                  <label className="label text-xs">Agama</label>
                  <select
                    className="input"
                    value={member.religion}
                    onChange={(e) => updateMember(idx, "religion", e.target.value)}
                  >
                    <option value="">—</option>
                    {AGAMA.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={member.isDeceased}
                    onChange={(e) => updateMember(idx, "isDeceased", e.target.checked)}
                    className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs text-slate-600">Meninggal</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeMember(idx)}
                  className="btn btn-secondary btn-sm !text-red-600 !border-red-200 hover:!bg-red-50"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={addMember} className="btn btn-secondary btn-sm w-full">
              <IconPlus className="w-4 h-4" />
              Tambah Anggota
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {loading ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
