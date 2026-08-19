import { NextResponse } from "next/server";

/**
 * Kompatibilitas backward: route lama /uploads/:filename sekarang
 * hanya mengembalikan 410 Gone karena file sudah pindah ke Vercel Blob.
 * URL baru langsung berupa Vercel Blob URL yang disimpan di database.
 */
export async function GET() {
  return NextResponse.json(
    { error: "File telah dipindahkan ke Vercel Blob. Gunakan URL baru dari database." },
    { status: 410 }
  );
}
