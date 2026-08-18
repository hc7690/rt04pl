"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fire, pullAll, syncAll, syncSetting, type SyncResult } from "@/lib/sync";

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session && session.user.role === "admin";
}

async function recordLastSync(mode: "push" | "pull") {
  const session = await getServerSession(authOptions);
  const value = JSON.stringify({
    at: new Date().toISOString(),
    by: session?.user?.name || "Admin",
    mode,
  });
  await prisma.setting.upsert({
    where: { key: "lastSync" },
    update: { value },
    create: { key: "lastSync", value },
  });
  fire(syncSetting("lastSync", value));
}

export async function pushAllData(): Promise<SyncResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  const result = await syncAll();
  if (result.ok) await recordLastSync("push");
  revalidatePath("/admin/sinkronisasi");
  return result;
}

export async function pullAllData(): Promise<SyncResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  const result = await pullAll();
  if (result.ok) await recordLastSync("pull");
  revalidatePath("/admin/sinkronisasi");
  return result;
}
