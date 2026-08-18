import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

/**
 * Menyajikan foto KTP warga — hanya boleh diakses oleh:
 * 1. Admin, atau
 * 2. Pemilik akun itu sendiri.
 * File KTP disimpan di folder private (bukan public) sehingga tidak bisa
 * diakses langsung melalui URL biasa.
 */
export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
  }
  if (session.user.role !== "admin" && session.user.id !== params.userId) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.userId } });
  if (!user?.ktpPhoto) {
    return NextResponse.json({ error: "Foto KTP tidak ditemukan" }, { status: 404 });
  }

  // Foto KTP lama yang masih di folder public (sebelum fitur privasi) — redirect
  if (user.ktpPhoto.startsWith("/uploads/")) {
    return NextResponse.redirect(new URL(user.ktpPhoto, req.url));
  }

  if (!user.ktpPhoto.startsWith("ktp/")) {
    return NextResponse.json({ error: "Foto KTP tidak ditemukan" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "private", "uploads", user.ktpPhoto);
  const buf = await readFile(filePath).catch(() => null);
  if (!buf) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const ext = path.extname(user.ktpPhoto).slice(1).toLowerCase();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="${user.ktpPhoto.slice(4)}"`,
    },
  });
}
