import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IconMapPin, IconSearch, IconUsers } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function WargaDirectoryPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const q = searchParams.q?.trim() || "";
  const users = await prisma.user.findMany({
    where: {
      status: "active",
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { address: { contains: q } },
              { rtRw: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Direktori Warga</h1>
        <p className="mt-1 text-slate-500">
          {users.length} warga terdaftar — klik nama untuk melihat profil. Data sensitif
          (NIK, nomor HP, email, dan foto KTP) hanya terlihat oleh admin dan pemilik akun.
        </p>
      </div>

      <form method="GET" className="relative mt-6 max-w-md">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, alamat, atau RT/RW…"
          className="input pl-10"
        />
      </form>

      {users.length === 0 ? (
        <div className="card mt-6 flex items-center justify-center gap-2 px-4 py-12 text-sm text-slate-400">
          <IconUsers className="w-5 h-5" />
          Tidak ada warga yang ditemukan.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Link
              key={u.id}
              href={`/warga/${u.id}`}
              className="card group p-5 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold">
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {u.name}
                  </p>
                  {u.occupation && (
                    <p className="truncate text-xs text-slate-500">{u.occupation}</p>
                  )}
                </div>
              </div>
              <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-600">
                <IconMapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                <span className="line-clamp-2">
                  {u.address || "Alamat belum diisi"}
                  {u.rtRw ? ` (RT ${u.rtRw})` : ""}
                </span>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
