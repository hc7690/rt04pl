import ArticleForm from "@/components/ArticleForm";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Tulis Artikel Baru</h1>
      <p className="mt-1 text-slate-500 mb-6">Lengkapi informasi artikel di bawah ini.</p>
      <ArticleForm />
    </div>
  );
}
