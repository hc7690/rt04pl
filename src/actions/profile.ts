"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fire, syncUser } from "@/lib/sync";

export type ActionResult = { ok: true } | { ok: false; error: string };

export type FamilyMemberInput = {
  id?: string;
  name: string;
  status: string;
  religion?: string;
  isDeceased?: boolean;
};

// Update profil warga (oleh pemilik akun)
export async function updateProfile(input: {
  name?: string;
  phone?: string;
  occupation?: string;
  profileVisibility?: string;
  familyMembers?: FamilyMemberInput[];
}): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, error: "Tidak diizinkan" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { ok: false, error: "Akun tidak ditemukan" };

  // Update data user
  const updateData: Record<string, string | null | undefined> = {}; 
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.phone !== undefined) updateData.phone = input.phone.trim();
  if (input.occupation !== undefined) updateData.occupation = input.occupation.trim();
  if (input.profileVisibility !== undefined) updateData.profileVisibility = input.profileVisibility;

  if (Object.keys(updateData).length > 0) {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
 p   });
    fire(syncUser(updated));
  }

  // Update anggota KK
  if (input.familyMembers !== undefined) {
    // Hapus semua anggota lama
    await prisma.familyMember.deleteMany({ where: { userId: session.user.id } });
    
    // Tambah anggota baru
    if (input.familyMembers.length > 0) {
      await prisma.familyMember.createMany({
        data: input.familyMembers.map((m) => ({
          userId: session.user.id,
          name: m.name.trim(),
          status: m.status,
          religion: m.religion || null,
          isDeceased: m.isDeceased || false,
        })),
      });
    }
  }

  revalidatePath("/profil");
  revalidatePath("/warga");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Admin update profil warga lain
export async function adminUpdateProfile(userId: string, input: {
  name?: string;
  phone?: string;
  occupation?: string;
  gender?: string;
  religion?: string;
  maritalStatus?: string;
  address?: string;
  domicileBlock?: string;
  domicileNumber?: string;
  hasKTPSukajaya?: string;
  profileVisibility?: string;
  status?: string;
  role?: string;
  familyMembers?: FamilyMemberInput[];
}): Promise<ActionResult> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return { ok: false, error: "Tidak diizinkan" };
  }

  const updateData: Record<string, string | null | undefined> = {}; 
  const fields = [
    "name", "phone", "occupation", "gender", "religion", "maritalStatus",
    "address", "domicileBlock", "domicileNumber", "hasKTPSukajaya",
    "profileVisibility", "status", "role",
  ];

  for (const field of fields) {
    if (input[field] !== undefined) {
      updateData[field] = input[field];
    }
  }

  // Bangun alamat domisili jika ada perubahan
  if (input.domicileBlock !== undefined || input.domicileNumber !== undefined) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const block = input.domicileBlock ?? user.domicileBlock ?? "";
      const num = input.domicileNumber ?? user.domicileNumber ?? "";
      if (block && num) {
        updateData.address = `Puri Lestari Blok ${block} No. ${num}`;
      }
    }
  }

  if (Object.keys(updateData).length > 0) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    fire(syncUser(updated));
  }

  // Update anggota KK
  if (input.familyMembers !== undefined) {
    await prisma.familyMember.deleteMany({ where: { userId } });
    if (input.familyMembers.length > 0) {
      await prisma.familyMember.createMany({
        data: input.familyMembers.map((m) => ({
          userId,
          name: m.name.trim(),
          status: m.status,
          religion: m.religion || null,
          isDeceased: m.isDeceased || false,
        })),
      });
    }
  }

  revalidatePath("/admin/warga");
  revalidatePath(`/admin/warga/${userId}`);
  revalidatePath("/warga");
  revalidatePath(`/warga/${userId}`);
  return { ok: true };
}
