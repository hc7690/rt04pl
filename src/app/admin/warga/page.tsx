import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import UserActions from "@/components/UserActions";
import { IconEye, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminWargaPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  const q = searchParams.q?.trim() || "";

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { nik: { contains: q } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Data Warga</h1>
      <p className="mt-1 text-slate-500 mb-4">
        {users.length} akun terdaftar — klik nama warga untuk melihat profil lengkapnya.
      </p>

      <form method="GET" className="relative max-w-md">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, email, atau NIK…"
          className="input pl-10"
        />
      </form>

      <div className="card mt-4 overflow-hidden">
        {users.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">Tidak ada warga yang ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Nama</th>
                  <th className="table-th">NIK</th>
                  <th className="table-th">Peran</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Terdaftar</th>
                  <th className="table-th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="table-td">
                      <Link href={`/admin/warga/${u.id}`} className="flex items-center gap-3 group">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                            {u.name}
                          </p>
                          <p className="truncate text-xs text-slate-400">{u.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="table-td font-mono text-xs">{u.nik || "—"}</td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          u.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role === "admin" ? "Admin" : "Warga"}
                      </span>
                    </td>
                    <td className="table-td">
                      <span
                        className={`badge ${
                          u.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {u.status === "active" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="table-td whitespace-nowrap">{formatDateShort(u.createdAt)}</td>
                    <td className="table-td">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/warga/${u.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Lihat profil lengkap"
                        >
                          <IconEye className="w-4 h-4" />
                          Profil
                        </Link>
                        <UserActions
                          id={u.id}
                          role={u.role}
                          status={u.status}
                          isSelf={u.id === session?.user.id}
                        />
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
