"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { deleteFromFirebase, fire, syncArticle } from "@/lib/sync";

export type ArticleInput = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  status: string;
};

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string };

async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session && session.user.role === "admin";
}

async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base) || "artikel";
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (!existing) return slug;
  return `${slug}-${Date.now().toString(36).slice(-5)}`;
}

export async function createArticle(input: ArticleInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  if (!input.title.trim()) return { ok: false, error: "Judul wajib diisi" };
  if (!input.content.trim()) return { ok: false, error: "Konten artikel wajib diisi" };

  const session = await getServerSession(authOptions);
  const slug = await uniqueSlug(input.title);

  const article = await prisma.article.create({
    data: {
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt.trim() || null,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category || "Pengumuman",
      status: input.status === "draft" ? "draft" : "published",
      authorId: session!.user.id,
    },
  });

  fire(syncArticle(article));

  revalidatePath("/");
  revalidatePath("/artikel");
  revalidatePath("/admin/artikel");
  return { ok: true, id: article.id };
}

export async function updateArticle(id: string, input: ArticleInput): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  if (!input.title.trim()) return { ok: false, error: "Judul wajib diisi" };
  if (!input.content.trim()) return { ok: false, error: "Konten artikel wajib diisi" };

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Artikel tidak ditemukan" };

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: input.title.trim(),
      excerpt: input.excerpt.trim() || null,
      content: input.content,
      coverImage: input.coverImage || null,
      category: input.category || "Pengumuman",
      status: input.status === "draft" ? "draft" : "published",
    },
  });

  fire(syncArticle(article));

  revalidatePath("/");
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${existing.slug}`);
  revalidatePath("/admin/artikel");
  return { ok: true };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  if (!(await requireAdmin())) return { ok: false, error: "Tidak diizinkan" };
  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Artikel tidak ditemukan" };
  await prisma.article.delete({ where: { id } });

  fire(deleteFromFirebase("articles", id));

  revalidatePath("/");
  revalidatePath("/artikel");
  revalidatePath(`/artikel/${existing.slug}`);
  revalidatePath("/admin/artikel");
  return { ok: true };
}
