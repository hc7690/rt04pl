"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle, type ArticleInput } from "@/actions/article";
import ImageUpload from "./ImageUpload";
import RichEditor from "./RichEditor";
import { IconAlert } from "./icons";

const CATEGORIES = ["Pengumuman", "Kegiatan", "Keuangan", "Sosial", "Keamanan", "Umum", "Lainnya"];

type Props = {
  initial?: {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string;
    category: string;
    status: string;
  };
};

export default function ArticleForm({ initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Pengumuman");
  const [status, setStatus] = useState(initial?.status ?? "published");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const input: ArticleInput = { title, excerpt, content, coverImage, category, status };
      const result = initial
        ? await updateArticle(initial.id, input)
        : await createArticle(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/artikel");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <label className="label" htmlFor="title">
              Judul Artikel <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              className="input"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul artikel yang menarik…"
            />
          </div>
          <div>
            <label className="label" htmlFor="excerpt">
              Ringkasan (opsional)
            </label>
            <textarea
              id="excerpt"
              className="input resize-y"
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat yang tampil di daftar artikel"
            />
          </div>
          <div>
            <label className="label" htmlFor="content">
              Isi Artikel <span className="text-red-500">*</span>
            </label>
            <RichEditor value={content} onChange={setContent} />
          </div>
        </div>

        <div className="space-y-5">
          <ImageUpload label="Gambar Sampul" value={coverImage} onChange={setCoverImage} />
          <div>
            <label className="label" htmlFor="category">
              Kategori
            </label>
            <input
              id="category"
              className="input"
              list="kategori-list"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <datalist id="kategori-list">
              {CATEGORIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="published">Terbit (publik)</option>
              <option value="draft">Draft (tersembunyi)</option>
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {loading ? "Menyimpan…" : "Simpan Artikel"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/artikel")}
              className="btn btn-secondary"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
