"use client";

import { useRef, useState } from "react";
import { IconBold, IconHeading, IconImage, IconItalic, IconLink, IconList, IconQuote } from "./icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
};

export default function RichEditor({ value, onChange, rows = 16 }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  function wrap(prefix: string, suffix = prefix) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || "teks";
    const next = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + prefix.length;
      el.selectionEnd = start + prefix.length + selected.length;
    });
  }

  function insertAtCursor(text: string) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const next = value.slice(0, start) + text + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = start + text.length;
      el.selectionEnd = start + text.length;
    });
  }

  async function insertImage() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengunggah");
        insertAtCursor(`\n![gambar](${data.url})\n`);
      } catch {
        alert("Gagal mengunggah gambar");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  const tools: Array<{ icon: React.ReactNode; title: string; onClick: () => void; disabled?: boolean }> = [
    { icon: <IconBold className="w-4 h-4" />, title: "Tebal", onClick: () => wrap("**") },
    { icon: <IconItalic className="w-4 h-4" />, title: "Miring", onClick: () => wrap("*") },
    { icon: <IconHeading className="w-4 h-4" />, title: "Subjudul", onClick: () => insertAtCursor("\n## "), },
    { icon: <IconList className="w-4 h-4" />, title: "Daftar", onClick: () => insertAtCursor("\n- "), },
    { icon: <IconQuote className="w-4 h-4" />, title: "Kutipan", onClick: () => insertAtCursor("\n> "), },
    { icon: <IconLink className="w-4 h-4" />, title: "Tautan", onClick: () => wrap("[", "](https://)") },
    {
      icon: <IconImage className="w-4 h-4" />,
      title: "Sisipkan gambar",
      onClick: insertImage,
      disabled: uploading,
    },
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        {tools.map((t, i) => (
          <button
            key={i}
            type="button"
            title={t.title}
            disabled={t.disabled}
            onClick={t.onClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-700 disabled:opacity-50"
          >
            {t.icon}
          </button>
        ))}
        <span className="ml-auto hidden sm:block text-[11px] text-slate-400 px-2">
          Mendukung format teks sederhana (markdown)
        </span>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Tulis isi artikel di sini…"
        className="w-full resize-y bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
