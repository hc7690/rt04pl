import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { deleteArticle } from "@/actions/article";
import ConfirmAction from "@/components/ConfirmAction";
import { IconPencil, IconPlus } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminArtikelPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status === "draft" ? "draft" : undefined;

  const articles = await prisma.article.findMany({
    where: status ? { status } : {},
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kelola Artikel</h1>
          <p className="mt-1 text-slate-500">{articles.length} artikel</p>
        </div>
        <Link href="/admin/artikel/baru" className="btn btn-primary self-start">
          <IconPlus className="w-4 h-4" />
          Tulis Artikel Baru
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/artikel"
          className={`btn btn-sm ${!status ? "btn-primary" : "btn-secondary"}`}
        >
          Semua
        </Link>
        <Link
          href="/admin/artikel?status=draft"
          className={`btn btn-sm ${status === "draft" ? "btn-primary" : "btn-secondary"}`}
        >
          Draft
        </Link>
      </div>

      <div className="card mt-4 overflow-hidden">
        {articles.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">Belum ada artikel.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Judul</th>
                  <th className="table-th">Kategori</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Penulis</th>
                  <th className="table-th">Tanggal</th>
                  <th className="table-th">Dilihat</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <Link
                        href={`/artikel/${a.slug}`}
                        className="line-clamp-1 font-semibold text-slate-900 hover:text-emerald-700"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="table-td">
                      <span className="badge bg-slate-100 text-slate-600">{a.category}</span>
                    </td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          a.status === "published"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {a.status === "published" ? "Terbit" : "Draft"}
                      </span>
                    </td>
                    <td className="table-td">{a.author.name}</td>
                    <td className="table-td whitespace-nowrap">{formatDateShort(a.createdAt)}</td>
                    <td className="table-td">{a.views}</td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/artikel/${a.id}/edit`}
                          className="btn btn-secondary btn-sm"
                        >
                          <IconPencil className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <ConfirmAction action={deleteArticle.bind(null, a.id)} label="Hapus" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
