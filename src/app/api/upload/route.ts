import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
    const filename = `\( {randomUUID()}. \){ext}`;
    const pathname = kind === "ktp" ? `ktp/\( {filename}` : `uploads/ \){filename}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
