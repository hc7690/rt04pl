import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const article = await prisma.article.findUnique({ where: { id: params.id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Edit Artikel</h1>
      <p className="mt-1 text-slate-500 mb-6">Perbarui informasi artikel.</p>
      <ArticleForm
        initial={{
          id: article.id,
          title: article.title,
          excerpt: article.excerpt ?? "",
          content: article.content,
          coverImage: article.coverImage ?? "",
          category: article.category,
          status: article.status,
        }}
      />
    </div>
  );
}
