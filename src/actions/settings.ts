"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fire, syncSetting } from "@/lib/sync";

export type ProfileInput = {
  namaRT: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  logo: string;
  deskripsi: string;
  visi: string;
  misi: string;
  ketuaName: string;
  bendaharaName: string;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return { ok: false, error: "Tidak diizinkan" };
  }
  if (!input.namaRT.trim()) return { ok: false, error: "Nama RT wajib diisi" };

  const value = JSON.stringify(input);
  await prisma.setting.upsert({
    where: { key: "profile" },
    update: { value },
    create: { key: "profile", value },
  });

  fire(syncSetting("profile", value));

  revalidatePath("/");
  revalidatePath("/profil");
  revalidatePath("/admin/profil");
  revalidatePath("/laporan-keuangan");
  return { ok: true };
}

export type SignaturesInput = {
  ketua: string;
  bendahara: string;
  stamp: string;
};

export async function saveSignatures(input: SignaturesInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return { ok: false, error: "Tidak diizinkan" };
  }

  const value = JSON.stringify({
    ketua: input.ketua.trim(),
    bendahara: input.bendahara.trim(),
    stamp: input.stamp.trim(),
  });
  await prisma.setting.upsert({
    where: { key: "signatures" },
    update: { value },
    create: { key: "signatures", value },
  });

  fire(syncSetting("signatures", value));

  revalidatePath("/laporan-keuangan");
  revalidatePath("/admin/tandatangan");
  return { ok: true };
}
