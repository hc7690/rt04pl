"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromFirebase, fire, syncUser } from "@/lib/sync";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") return null;
  return session;
}

export async function updateUserStatus(id: string, status: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Tidak diizinkan" };
  if (id === session.user.id) return { ok: false, error: "Tidak dapat mengubah status akun sendiri" };
  if (status !== "active" && status !== "disabled") return { ok: false, error: "Status tidak valid" };

  const user = await prisma.user.update({ where: { id }, data: { status } });
  fire(syncUser(user));
  revalidatePath("/admin/warga");
  return { ok: true };
}

export async function updateUserRole(id: string, role: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Tidak diizinkan" };
  if (id === session.user.id) return { ok: false, error: "Tidak dapat mengubah peran akun sendiri" };
  if (role !== "admin" && role !== "user") return { ok: false, error: "Peran tidak valid" };

  const user = await prisma.user.update({ where: { id }, data: { role } });
  fire(syncUser(user));
  revalidatePath("/admin/warga");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: "Tidak diizinkan" };
  if (id === session.user.id) return { ok: false, error: "Tidak dapat menghapus akun sendiri" };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { ok: false, error: "User tidak ditemukan" };

  const adminCount = await prisma.user.count({ where: { role: "admin", status: "active" } });
  if (user.role === "admin" && adminCount <= 1) {
    return { ok: false, error: "Tidak dapat menghapus admin terakhir" };
  }

  await prisma.user.delete({ where: { id } });
  fire(deleteFromFirebase("users", id));
  revalidatePath("/admin/warga");
  return { ok: true };
}
