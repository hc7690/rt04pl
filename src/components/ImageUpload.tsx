"use client";

import { useRef, useState } from "react";
import { IconAlert, IconTrash, IconUpload } from "./icons";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: "cover" | "square";
  /** kind="ktp" menyimpan file di folder private dan mengembalikan path "ktp/<file>". */
  kind?: "image" | "ktp" | "proof" | "signature" | "stamp";
};

export default function ImageUpload({
  value,
  onChange,
  label = "Gambar",
  aspect = "cover",
  kind = "image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  // Untuk kind="ktp" nilai value adalah path private (tidak bisa tampil langsung),
  // jadi pratinjau memakai object URL dari file yang dipilih.
  const [preview, setPreview] = useState<string>("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    if (kind === "ktp") setPreview(objectUrl);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mengunggah gambar");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }

  const shown = value || (kind === "ktp" ? preview : "");

  return (
    <div>
      <span className="label">{label}</span>
      {shown ? (
        <div className="relative overflow-hidden rounded-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shown}
            alt={label}
            className={`w-full object-cover ${aspect === "square" ? "aspect-square max-w-[180px]" : "aspect-video max-h-72"}`}
          />
          <button
            type="button"
            onClick={() => {
              onChange("");
              setPreview("");
            }}
            className="absolute top-2 right-2 btn btn-danger btn-sm !bg-white/90 backdrop-blur"
          >
            <IconTrash className="w-4 h-4" />
            Hapus
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-slate-500 transition hover:border-emerald-400 hover:bg-emerald-50/50"
        >
          {uploading ? (
            <>
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <span className="text-sm">Mengunggah…</span>
            </>
          ) : (
            <>
              <IconUpload className="w-6 h-6" />
              <span className="text-sm">Klik untuk memilih gambar (JPG/PNG/WebP/GIF, maks 5MB)</span>
            </>
          )}
        </button>
      )}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <IconAlert className="w-4 h-4" />
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
