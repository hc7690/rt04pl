"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fire, syncUser } from "@/lib/sync";

export type ActionResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateAccount(input: {
  currentPassword: string;
  email: string;
  newPassword?: string;
}): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Tidak diizinkan" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Akun tidak ditemukan" };

  if (!input.currentPassword) {
    return { ok: false, error: "Password saat ini wajib diisi" };
  }
  const valid = await bcrypt.compare(input.currentPassword, user.password);
  if (!valid) return { ok: false, error: "Password saat ini salah" };

  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid" };

  const newPassword = input.newPassword?.trim() ?? "";
  if (newPassword && newPassword.length < 6) {
    return { ok: false, error: "Password baru minimal 6 karakter" };
  }

  if (email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { ok: false, error: "Email sudah digunakan akun lain" };
  }

  const data: { email: string; password?: string } = { email };
  if (newPassword) data.password = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({ where: { id: user.id }, data });

  // Sinkronkan perubahan ke Firebase (jika dikonfigurasi)
  fire(syncUser(updated));

  revalidatePath("/admin/akun");
  return { ok: true };
}
