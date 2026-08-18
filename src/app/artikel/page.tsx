import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ArticleCard from "@/components/ArticleCard";
import { IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

const PER_PAGE = 9;

export default async function ArticleListPage({
  searchParams,
}: {
  searchParams: { q?: string; kategori?: string; page?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const kategori = searchParams.kategori?.trim() || "";
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);

  const where = {
    status: "published",
    ...(q ? { OR: [{ title: { contains: q } }, { excerpt: { contains: q } }] } : {}),
    ...(kategori ? { category: kategori } : {}),
  };

  const [articles, total, categories] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.article.count({ where }),
    prisma.article.findMany({
      where: { status: "published" },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const queryParams = new URLSearchParams();
  if (q) queryParams.set("q", q);
  if (kategori) queryParams.set("kategori", kategori);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Artikel &amp; Pengumuman</h1>
        <p className="mt-2 text-slate-500">
          Informasi kegiatan, pengumuman, dan kabar terbaru dari {""}
          <span className="font-semibold text-slate-700">RT</span> untuk seluruh warga.
        </p>
      </div>

      {/* Filter bar */}
      <form method="GET" className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Cari artikel…"
            className="input pl-10"
          />
        </div>
        <select name="kategori" defaultValue={kategori} className="input sm:w-56">
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">
          <IconSearch className="w-4 h-4" />
          Cari
        </button>
        {(q || kategori) && (
          <Link href="/artikel" className="btn btn-secondary">
            Reset
          </Link>
        )}
      </form>

      {/* Grid */}
      {articles.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <p className="text-slate-500">Tidak ada artikel yang ditemukan.</p>
          <Link href="/artikel" className="btn btn-secondary mt-4">
            Lihat semua artikel
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams(queryParams);
            if (p > 1) params.set("page", String(p));
            const href = `/artikel${params.size ? `?${params}` : ""}`;
            return (
              <Link
                key={p}
                href={href}
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${
                  p === page
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
