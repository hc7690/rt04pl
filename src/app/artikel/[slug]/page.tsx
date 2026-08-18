import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { IconArrowRight, IconClock, IconEye } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return { title: "Artikel tidak ditemukan" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });
  if (!article || article.status !== "published") notFound();

  // Hitung kunjungan
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <Link
        href="/artikel"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        <IconArrowRight className="w-4 h-4 rotate-180" />
        Kembali ke Artikel
      </Link>

      <header className="mt-6">
        <div className="flex items-center gap-3">
          <span className="badge bg-emerald-100 text-emerald-700">{article.category}</span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <IconClock className="w-3.5 h-3.5" />
            {formatDateTime(article.createdAt)}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <IconEye className="w-3.5 h-3.5" />
            {article.views} dilihat
          </span>
        </div>
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight text-slate-900">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          Ditulis oleh <span className="font-semibold text-slate-700">{article.author.name}</span>
        </p>
      </header>

      {article.coverImage && (
        <div className="mt-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      <div className="markdown-body mt-6">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
}
