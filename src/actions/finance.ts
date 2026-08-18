"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/utils";
import { deleteFromFirebase, fire, syncCategory, syncTransaction } from "@/lib/sync";

export type TransactionInput = {
  type: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  proofImage: string;
};

export type CategoryInput = {
  name: string;
  type: string;
  sort?: number;
};

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session && session.user.role === "admin";
}

export async function createTransaction(input: TransactionInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  return saveTransaction(null, input);
}

export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  return saveTransaction(id, input);
}

async function saveTransaction(
  id: string | null,
  input: TransactionInput
): Promise<ActionResult> {
  if (!input.categoryId) return { ok: false, error: "Kategori wajib dipilih" };
  if (!input.amount || input.amount <= 0) return { ok: false, error: "Nominal harus lebih dari 0" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: "Tanggal tidak valid" };

  const category = await prisma.financeCategory.findUnique({
    where: { id: input.categoryId },
  });
  if (!category) return { ok: false, error: "Kategori tidak ditemukan" };
  if (input.type !== "pemasukan" && input.type !== "pengeluaran") {
    return { ok: false, error: "Tipe transaksi tidak valid" };
  }
  if (category.type !== input.type) {
    return { ok: false, error: "Kategori tidak sesuai dengan tipe transaksi" };
  }

  const session = await getServerSession(authOptions);
  const data = {
    type: input.type,
    categoryId: input.categoryId,
    amount: Math.round(Number(input.amount)),
    description: input.description.trim() || null,
    date: parseDateInput(input.date),
    proofImage: input.proofImage || null,
    createdById: session!.user.id,
  };

  const txn = id
    ? await prisma.transaction.update({ where: { id }, data })
    : await prisma.transaction.create({ data });

  fire(syncTransaction(txn));

  revalidatePath("/laporan-keuangan");
  revalidatePath("/admin/keuangan");
  return { ok: true, id: txn.id };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Transaksi tidak ditemukan" };
  await prisma.transaction.delete({ where: { id } });

  fire(deleteFromFirebase("transactions", id));

  revalidatePath("/laporan-keuangan");
  revalidatePath("/admin/keuangan");
  return { ok: true };
}

export async function createCategory(input: CategoryInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  if (!input.name.trim()) return { ok: false, error: "Nama kategori wajib diisi" };
  if (input.type !== "pemasukan" && input.type !== "pengeluaran") {
    return { ok: false, error: "Tipe kategori tidak valid" };
  }

  const category = await prisma.financeCategory.create({
    data: {
      name: input.name.trim(),
      type: input.type,
      sort: input.sort ?? 0,
    },
  });

  fire(syncCategory(category));

  revalidatePath("/admin/keuangan/kategori");
  revalidatePath("/admin/keuangan");
  return { ok: true, id: category.id };
}

export async function updateCategory(id: string, input: CategoryInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  if (!input.name.trim()) return { ok: false, error: "Nama kategori wajib diisi" };

  const category = await prisma.financeCategory.update({
    where: { id },
    data: { name: input.name.trim(), type: input.type, sort: input.sort ?? 0 },
  });

  fire(syncCategory(category));

  revalidatePath("/admin/keuangan/kategori");
  revalidatePath("/admin/keuangan");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  const used = await prisma.transaction.count({ where: { categoryId: id } });
  if (used > 0) {
    return {
      ok: false,
      error: `Kategori masih dipakai oleh ${used} transaksi. Pindahkan atau hapus transaksi terlebih dahulu.`,
    };
  }
  await prisma.financeCategory.delete({ where: { id } });

  fire(deleteFromFirebase("categories", id));

  revalidatePath("/admin/keuangan/kategori");
  revalidatePath("/admin/keuangan");
  return { ok: true };
}
