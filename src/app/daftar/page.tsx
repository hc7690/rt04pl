"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser, type RegisterInput, type FamilyMemberInput } from "@/actions/auth";
import ImageUpload from "@/components/ImageUpload";
import { IconAlert, IconCheck, IconInfo, IconPlus, IconTrash } from "@/components/icons";

const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"];
const STATUS = ["Belum Kawin", "Kawin", "Cerai Hidup", "Cerai Mati"];
const STATUS_ANGGOTA = ["Suami", "Istri", "Anak", "Orang Tua", "Lainnya"];

// Blok Puri Lestari: F-5 sampai F-20
const BLOK_OPTIONS = Array.from({ length: 16 }, (_, i) => `F-${i + 5}`);

const initial: RegisterInput = {
  email: "",
  password: "",
  name: "",
  nik: "",
  placeOfBirth: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  rtRw: "",
  kelurahan: "",
  kecamatan: "",
  city: "",
  province: "",
  postalCode: "",
  religion: "",
  maritalStatus: "",
  occupation: "",
  nationality: "WNI",
  phone: "",
  ktpPhoto: "",
  // Field baru
  isHeadOfFamily: false,
  domicileBlock: "",
  domicileNumber: "",
  hasKTPSukajaya: "belum",
  houseOwnership: "tetap",
  kkPhoto: "",
  familyMembers: [],
};

export default function DaftarPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterInput>(initial);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Family member helpers
  function addFamilyMember() {
    set("familyMembers", [
      ...(form.familyMembers || []),
      { name: "", status: "Anak", religion: "" },
    ]);
  }

  function updateFamilyMember(index: number, field: keyof FamilyMemberInput, value: string) {
    const members = [...(form.familyMembers || [])];
    members[index] = { ...members[index], [field]: value };
    set("familyMembers", members);
  }

  function removeFamilyMember(index: number) {
    const members = (form.familyMembers || []).filter((_, i) => i !== index);
    set("familyMembers", members);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.isHeadOfFamily) {
      setError("Anda harus memastikan bahwa Anda adalah Kepala Keluarga untuk mendaftar.");
      return;
    }

    if (form.password !== confirmPassword) {
      setError("Konfirmasi password tidak sesuai.");
      return;
    }

    if (!form.domicileBlock) {
      setError("Blok domisili wajib dipilih.");
      return;
    }

    if (!form.domicileNumber?.trim()) {
      setError("Nomor rumah wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      const res = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (!res?.error) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="card p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <IconCheck className="w-7 h-7" />
          </span>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Registrasi Berhasil!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Akun Anda telah terdaftar. Silakan lanjutkan.
          </p>
          <Link href="/login" className="btn btn-primary mt-6 w-full">
            Lanjut ke Halaman Masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Registrasi Warga</h1>
        <p className="mt-2 text-slate-500">
          Hanya <strong>Kepala Keluarga</strong> yang diperbolehkan mendaftar. Isi data sesuai KTP Anda.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card mt-6 p-6 sm:p-8">

        {/* === KONFIRMASI KEPALA KELUARGA === */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isHeadOfFamily}
              onChange={(e) => set("isHeadOfFamily", e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <p className="font-bold text-amber-800">Pastikan Anda adalah Kepala Keluarga</p>
              <p className="text-xs text-amber-600 mt-1">
                Cukup 1 orang yang registrasi dalam 1 KK yaitu Kepala Keluarga.
                Data anggota KK akan ditambahkan di bawah.
              </p>
            </div>
          </label>
        </div>

        {/* Data KTP */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Data KTP</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="nik">NIK <span className="text-red-500">*</span></label>
            <input
              id="nik"
              className="input"
              inputMode="numeric"
              maxLength={16}
              required
              placeholder="16 digit nomor KTP"
              value={form.nik}
              onChange={(e) => set("nik", e.target.value.replace(/\D/g, ""))}
            />
            {form.nik.length > 0 && form.nik.length < 16 && (
              <p className="mt-1 text-xs text-amber-600">NIK harus 16 digit angka</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></label>
            <input
              id="name"
              className="input"
              required
              placeholder="Sesuai KTP"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="placeOfBirth">Tempat Lahir <span className="text-red-500">*</span></label>
            <input
              id="placeOfBirth"
              className="input"
              required
              value={form.placeOfBirth}
              onChange={(e) => set("placeOfBirth", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="dateOfBirth">Tanggal Lahir <span className="text-red-500">*</span></label>
            <input
              id="dateOfBirth"
              type="date"
              className="input"
              required
              value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="gender">Jenis Kelamin <span className="text-red-500">*</span></label>
            <select
              id="gender"
              className="input"
              required
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
            >
              <option value="">— Pilih —</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="religion">Agama <span className="text-red-500">*</span></label>
            <select
              id="religion"
              className="input"
              required
              value={form.religion}
              onChange={(e) => set("religion", e.target.value)}
            >
              <option value="">— Pilih —</option>
              {AGAMA.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="maritalStatus">Status Perkawinan <span className="text-red-500">*</span></label>
            <select
              id="maritalStatus"
              className="input"
              required
              value={form.maritalStatus}
              onChange={(e) => set("maritalStatus", e.target.value)}
            >
              <option value="">— Pilih —</option>
              {STATUS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="occupation">Pekerjaan <span className="text-red-500">*</span></label>
            <input
              id="occupation"
              className="input"
              required
              value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="nationality">Kewarganegaraan</label>
            <input id="nationality" className="input" value={form.nationality} onChange={(e) => set("nationality", e.target.value)} />
          </div>
        </div>

        {/* === ALAMAT DOMISILI === */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Alamat Domisili</h2>
        <p className="text-xs text-slate-500 mt-1">
          Alamat tempat tinggal Anda di Puri Lestari. Digunakan untuk pencarian data warga.
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="domicileBlock">Blok <span className="text-red-500">*</span></label>
            <select
              id="domicileBlock"
              className="input"
              required
              value={form.domicileBlock}
              onChange={(e) => set("domicileBlock", e.target.value)}
            >
              <option value="">— Pilih Blok —</option>
              {BLOK_OPTIONS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="domicileNumber">No. Rumah <span className="text-red-500">*</span></label>
            <input
              id="domicileNumber"
              className="input"
              required
              placeholder="Contoh: 10"
              value={form.domicileNumber}
              onChange={(e) => set("domicileNumber", e.target.value)}
            />
          </div>
          <div className="sm:col-span-1">
            <label className="label">Alamat Lengkap</label>
            <p className="input bg-slate-50 text-sm text-slate-600">
              {form.domicileBlock && form.domicileNumber
                ? `Puri Lestari Blok ${form.domicileBlock} No. ${form.domicileNumber}`
                : "—"}
            </p>
          </div>
        </div>

        <div>
  <label className="label">Status Kepemilikan Rumah <span className="text-red-500">*</span></label>
  <div className="flex gap-4 mt-2">
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="houseOwnership"
        value="tetap"
        checked={form.houseOwnership === "tetap"}
        onChange={(e) => set("houseOwnership", e.target.value)}
        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="text-sm text-slate-700">Milik Sendiri (Tetap)</span>
    </label>
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name="houseOwnership"
        value="sewa"
        checked={form.houseOwnership === "sewa"}
        onChange={(e) => set("houseOwnership", e.target.value)}
        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="text-sm text-slate-700">Sewa</span>
    </label>
  </div>
</div>

        {/* === KTP SUKAJAYA === */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Data KTP Sukajaya</h2>
        <p className="text-xs text-slate-500 mt-1">
          Untuk memudahkan sensus penduduk dan pendataan warga.
        </p>
        <div className="mt-5">
          <label className="label">Sudah mempunyai KTP Sukajaya? <span className="text-red-500">*</span></label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasKTPSukajaya"
                value="ya"
                checked={form.hasKTPSukajaya === "ya"}
                onChange={(e) => set("hasKTPSukajaya", e.target.value)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Ya, sudah punya</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="hasKTPSukajaya"
                value="belum"
                checked={form.hasKTPSukajaya === "belum"}
                onChange={(e) => set("hasKTPSukajaya", e.target.value)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700">Belum</span>
            </label>
          </div>
        </div>

        {/* === ALAMAT KTP (opsional, bisa diisi manual) === */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Alamat Sesuai KTP</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="address">Alamat (Jalan, No. Rumah) <span className="text-red-500">*</span></label>
            <input
              id="address"
              className="input"
              required
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="rtRw">RT / RW</label>
            <input
              id="rtRw"
              className="input"
              placeholder="cth: 005/003"
              value={form.rtRw}
              onChange={(e) => set("rtRw", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="kelurahan">Kelurahan / Desa</label>
            <input
              id="kelurahan"
              className="input"
              value={form.kelurahan}
              onChange={(e) => set("kelurahan", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="kecamatan">Kecamatan</label>
            <input
              id="kecamatan"
              className="input"
              value={form.kecamatan}
              onChange={(e) => set("kecamatan", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="city">Kota / Kabupaten</label>
            <input
              id="city"
              className="input"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="province">Provinsi</label>
            <select
              id="province"
              className="input"
              value={form.province}
              onChange={(e) => set("province", e.target.value)}
            >
              <option value="">— Pilih —</option>
              {[
                "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi", "Sumatera Selatan", "Bengkulu",
                "Lampung", "Kepulauan Bangka Belitung", "Kepulauan Riau", "DKI Jakarta", "Jawa Barat",
                "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", "Banten", "Bali", "Nusa Tenggara Barat",
                "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
                "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Selatan",
                "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat", "Maluku", "Maluku Utara", "Papua",
                "Papua Barat", "Papua Tengah", "Papua Pegunungan", "Papua Selatan", "Papua Barat Daya",
              ].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="postalCode">Kode Pos</label>
            <input
              id="postalCode"
              className="input"
              inputMode="numeric"
              maxLength={5}
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))}
            />
          </div>
        </div>

        {/* === ANGGOTA KK === */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Anggota Kartu Keluarga</h2>
        <p className="text-xs text-slate-500 mt-1">
          Tambahkan seluruh anggota KK (termasuk Anda sebagai Kepala Keluarga).
        </p>
        <div className="mt-5 space-y-3">
          {(form.familyMembers || []).map((member, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50">
              <div className="flex-1 min-w-[200px]">
                <label className="label text-xs">Nama Anggota</label>
                <input
                  className="input"
                  placeholder="Nama lengkap"
                  value={member.name}
                  onChange={(e) => updateFamilyMember(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="label text-xs">Status</label>
                <select
                  className="input"
                  value={member.status}
                  onChange={(e) => updateFamilyMember(idx, "status", e.target.value)}
                >
                  {STATUS_ANGGOTA.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-36">
                <label className="label text-xs">Agama</label>
                <select
                  className="input"
                  value={member.religion || ""}
                  onChange={(e) => updateFamilyMember(idx, "religion", e.target.value)}
                >
                  <option value="">— Pilih —</option>
                  {AGAMA.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeFamilyMember(idx)}
                className="btn btn-secondary btn-sm !text-red-600 !border-red-200 hover:!bg-red-50"
                title="Hapus anggota"
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFamilyMember}
            className="btn btn-secondary w-full"
          >
            <IconPlus className="w-4 h-4" />
            Tambah Anggota KK
          </button>
        </div>

        {/* === UPLOAD KK === */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Upload Kartu Keluarga</h2>
        <p className="text-xs text-slate-500 mt-1">Opsional — untuk verifikasi data.</p>
        <div className="mt-5">
          <ImageUpload
            label="Foto Kartu Keluarga (opsional)"
            aspect="cover"
            kind="ktp"
            value={form.kkPhoto || ""}
            onChange={(url) => set("kkPhoto", url)}
          />
        </div>

        {/* Kontak & Akun */}
        <h2 className="mt-8 text-lg font-bold text-slate-900">Kontak &amp; Akun</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">No. HP / WA</label>
            <input
              id="phone"
              className="input"
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="email">Email <span className="text-red-500">*</span></label>
            <input
              id="email"
              type="email"
              className="input"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password <span className="text-red-500">*</span></label>
            <input
              id="password"
              type="password"
              className="input"
              required
              minLength={6}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">Konfirmasi Password <span className="text-red-500">*</span></label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload
              label="Foto KTP (opsional)"
              aspect="cover"
              kind="ktp"
              value={form.ktpPhoto || ""}
              onChange={(url) => set("ktpPhoto", url)}
            />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
          <IconInfo className="w-4 h-4 mt-0.5 shrink-0" />
          Data yang Anda isikan hanya digunakan untuk keperluan administrasi warga RT dan tidak akan
          disalahgunakan. Hanya Kepala Keluarga yang mendaftar — satu akun per KK.
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary mt-6 w-full">
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {loading ? "Mendaftarkan…" : "Daftar Sekarang"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Masuk di sini
          </Link>
        </p>
      </form>
    </div>
  );
}
