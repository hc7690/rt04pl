import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * Upload gambar.
 * - kind="ktp"      -> disimpan di folder PRIVATE (private/uploads/ktp),
 *                      hanya bisa diakses lewat /api/ktp/[userId] oleh admin
 *                      atau pemilik akun. Mengembalikan path "ktp/<file>".
 * - kind lainnya    -> disimpan di public/uploads (dapat diakses publik),
 *                      mengembalikan URL "/uploads/<file>".
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = String(formData.get("kind") || "image");
    if (!file || !file.size) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, WebP, atau GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const ext = EXT[file.type];
    const filename = `${randomUUID()}.${ext}`;

    if (kind === "ktp") {
      const dir = path.join(process.cwd(), "private", "uploads", "ktp");
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), buffer);
      return NextResponse.json({ url: `ktp/${filename}` });
    }

    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
