import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/**
 * Menyajikan file dari folder public/uploads langsung dari disk.
 * Nama file selalu UUID acak hasil upload, sehingga aman untuk
 * di-cache lama (immutable).
 */
export async function GET(
  _req: Request,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  // Cegah path traversal
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", filename);
  const buf = await readFile(filePath).catch(() => null);
  if (!buf) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  const ext = path.extname(filename).slice(1).toLowerCase();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
