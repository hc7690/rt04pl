"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFromFirebase, fire, syncMember } from "@/lib/sync";

export type MemberInput = {
  id?: string;
  group: string;
  position: string;
  name: string;
  photo: string;
  phone: string;
  sort: number;
  active: boolean;
};

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session && session.user.role === "admin";
}

export async function saveMember(input: MemberInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  if (!input.position.trim()) return { ok: false, error: "Jabatan wajib diisi" };
  if (!input.name.trim()) return { ok: false, error: "Nama wajib diisi" };
  if (!input.group.trim()) return { ok: false, error: "Kelompok/Seksi wajib diisi" };

  const data = {
    group: input.group.trim(),
    position: input.position.trim(),
    name: input.name.trim(),
    photo: input.photo || null,
    phone: input.phone.trim() || null,
    sort: Number(input.sort) || 0,
    active: input.active,
  };

  const member = input.id
    ? await prisma.orgMember.update({ where: { id: input.id }, data })
    : await prisma.orgMember.create({ data });

  fire(syncMember(member));

  revalidatePath("/profil/struktur");
  revalidatePath("/admin/struktur");
  return { ok: true, id: member.id };
}

export async function deleteMember(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  await prisma.orgMember.delete({ where: { id } });

  fire(deleteFromFirebase("orgMembers", id));

  revalidatePath("/profil/struktur");
  revalidatePath("/admin/struktur");
  return { ok: true };
}
