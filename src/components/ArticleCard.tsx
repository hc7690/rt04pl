import Link from "next/link";
import { formatDateShort } from "@/lib/utils";
import { IconClock, IconEye } from "./icons";

type Props = {
  article: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    category: string;
    createdAt: Date | string;
    views: number;
  };
};

export default function ArticleCard({ article }: Props) {
  return (
    <Link
      href={`/artikel/${article.slug}`}
      className="card group overflow-hidden transition hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-3xl font-bold">
            {article.category.charAt(0)}
          </div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/90 text-emerald-700 backdrop-blur">
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 font-bold text-slate-900 group-hover:text-emerald-700 transition">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-500">{article.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <IconClock className="w-3.5 h-3.5" />
            {formatDateShort(article.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <IconEye className="w-3.5 h-3.5" />
            {article.views} dilihat
          </span>
        </div>
      </div>
    </Link>
  );
}
