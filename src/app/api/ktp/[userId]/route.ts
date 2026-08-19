import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Menyajikan foto KTP warga — hanya boleh diakses oleh:
 * 1. Admin, atau
 * 2. Pemilik akun itu sendiri.
 * File KTP disimpan di Vercel Blob.
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

  // Redirect ke URL Vercel Blob
  return NextResponse.redirect(user.ktpPhoto);
}
