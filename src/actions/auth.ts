"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fire, syncUser } from "@/lib/sync";

export type FamilyMemberInput = {
  name: string;
  status: string; // suami | istri | anak | orang tua | lainnya
  religion?: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  nik: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  rtRw: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  nationality: string;
  phone: string;
  ktpPhoto?: string;
  // === Field baru ===
  isHeadOfFamily: boolean;
  domicileBlock: string;
  domicileNumber: string;
  hasKTPSukajaya: string;
  houseOwnership?: string;
  kkPhoto?: string;
  familyMembers?: FamilyMemberInput[];
};

export type ActionResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerUser(input: RegisterInput): Promise<ActionResult> {
  const required: Array<[keyof RegisterInput, string]> = [
    ["name", "Nama lengkap"],
    ["email", "Email"],
    ["password", "Password"],
    ["nik", "NIK"],
    ["placeOfBirth", "Tempat lahir"],
    ["dateOfBirth", "Tanggal lahir"],
    ["gender", "Jenis kelamin"],
    ["address", "Alamat"],
    ["religion", "Agama"],
    ["maritalStatus", "Status perkawinan"],
    ["occupation", "Pekerjaan"],
  ];

  for (const [key, label] of required) {
    const val = String(input[key] ?? "").trim();
    if (!val) return { ok: false, error: `${label} wajib diisi` };
  }

  // Validasi kepala keluarga
  if (!input.isHeadOfFamily) {
    return { ok: false, error: "Hanya Kepala Keluarga yang diperbolehkan mendaftar. Pastikan Anda adalah kepala keluarga." };
  }

  // Validasi domisili
  if (!input.domicileBlock) {
    return { ok: false, error: "Blok domisili wajib dipilih" };
  }
  if (!input.domicileNumber?.trim()) {
    return { ok: false, error: "Nomor rumah wajib diisi" };
  }

  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid" };

  const nik = input.nik.trim();
  if (!/^\d{16}$/.test(nik)) {
    return { ok: false, error: "NIK harus berupa 16 digit angka sesuai KTP" };
  }

  if (input.password.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    return { ok: false, error: "Tanggal lahir tidak valid" };
  }

  const [existingEmail, existingNik] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.user.findUnique({ where: { nik } }),
  ]);
  if (existingEmail) return { ok: false, error: "Email sudah terdaftar, silakan masuk" };
  if (existingNik) return { ok: false, error: "NIK sudah terdaftar, silakan masuk" };

  const password = await bcrypt.hash(input.password, 10);

  // Bangun alamat domisili: "Puri Lestari Blok F-10 No. 15"
  const domicileAddress = `Puri Lestari Blok ${input.domicileBlock} No. ${input.domicileNumber}`;

  const user = await prisma.user.create({
    data: {
      email,
      password,
      role: "user",
      name: input.name.trim(),
      nik,
      placeOfBirth: input.placeOfBirth.trim(),
      dateOfBirth: new Date(input.dateOfBirth),
      gender: input.gender,
      address: domicileAddress, // Alamat domisili
      rtRw: input.rtRw.trim(),
      kelurahan: input.kelurahan.trim(),
      kecamatan: input.kecamatan.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      postalCode: input.postalCode.trim(),
      religion: input.religion,
      maritalStatus: input.maritalStatus,
      occupation: input.occupation.trim(),
      nationality: input.nationality || "WNI",
      phone: input.phone.trim(),
      ktpPhoto: input.ktpPhoto || null,
      status: "active",
      // Field baru
      isHeadOfFamily: true,
      domicileBlock: input.domicileBlock,
      domicileNumber: input.domicileNumber.trim(),
      hasKTPSukajaya: input.hasKTPSukajaya || "belum",
      kkPhoto: input.kkPhoto || null,
      profileVisibility: "public",
    },
  });

  // Simpan anggota KK
  if (input.familyMembers && input.familyMembers.length > 0) {
    await prisma.familyMember.createMany({
      data: input.familyMembers.map((m) => ({
        userId: user.id,
        name: m.name.trim(),
        status: m.status,
        religion: m.religion || null,
        isDeceased: false,
      })),
    });
  }

  // Sinkronkan ke Firebase (jika dikonfigurasi)
  fire(syncUser(user));

  return { ok: true };
}
