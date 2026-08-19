import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import UserActions from "@/components/UserActions";
import { IconEye, IconSearch, IconUsers, IconHome, IconCheckCircle, IconAlert, IconHeart } from "@/components/icons";

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
            { domicileBlock: { contains: q } },
          ],
        }
      : {},
    include: { familyMembers: true },
    orderBy: { createdAt: "desc" },
  });

  // Hitung statistik
  const totalKK = users.filter((u) => u.isHeadOfFamily).length;
  const totalWarga = users.reduce((acc, u) => acc + 1 + u.familyMembers.length, 0);
  const ktpSukajaya = users.filter((u) => u.hasKTPSukajaya === "ya").length;
  const belumKTP = users.filter((u) => u.hasKTPSukajaya !== "ya").length;

  // Hitung anggota KK yang meninggal
  const totalMeninggal = users.reduce(
    (acc, u) => acc + u.familyMembers.filter((m) => m.isDeceased).length,
    0
  );

  // Hitung agama (berdasarkan kepala keluarga + anggota KK)
  const allReligions: string[] = [];
  users.forEach((u) => {
    if (u.religion) allReligions.push(u.religion);
    u.familyMembers.forEach((m) => {
      if (m.religion) allReligions.push(m.religion);
    });
  });
  const muslimCount = allReligions.filter((r) => r === "Islam").length;
  const nonMuslimCount = allReligions.length - muslimCount;

  const stats = [
    {
      icon: <IconHome className="w-5 h-5" />,
      label: "Total KK",
      value: totalKK,
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: <IconUsers className="w-5 h-5" />,
      label: "Total Warga",
      value: totalWarga,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      icon: <IconCheckCircle className="w-5 h-5" />,
      label: "KTP Sukajaya",
      value: `${ktpSukajaya} / ${belumKTP}`,
      sub: "ya / belum",
      color: "bg-violet-100 text-violet-700",
    },
    {
      icon: <IconHeart className="w-5 h-5" />,
      label: "Meninggal",
      value: totalMeninggal,
      color: "bg-red-100 text-red-700",
    },
    {
      icon: <IconUsers className="w-5 h-5" />,
      label: "Muslim",
      value: muslimCount,
      color: "bg-teal-100 text-teal-700",
    },
    {
      icon: <IconUsers className="w-5 h-5" />,
      label: "Non-Muslim",
      value: nonMuslimCount,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Data Warga</h1>
      <p className="mt-1 text-slate-500 mb-4">
        {users.length} Kepala Keluarga terdaftar — {totalWarga} warga total.
      </p>

      {/* Statistik */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="card p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              {s.icon}
            </div>
            <p className="mt-2 text-xl font-extrabold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
            {s.sub && <p className="text-xs text-slate-400">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Search */}
      <form method="GET" className="relative max-w-md">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Cari nama, email, NIK, atau blok…"
          className="input pl-10"
        />
      </form>

      {/* Tabel */}
      <div className="card mt-4 overflow-hidden">
        {users.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-400">Tidak ada warga yang ditemukan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="table-th">Nama</th>
                  <th className="table-th">Blok</th>
                  <th className="table-th">Anggota KK</th>
                  <th className="table-th">KTP Sukajaya</th>
                  <th className="table-th">Peran</th>
                  <th className="table-th">Status</th>
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
                    <td className="table-td">
                      <span className="badge bg-slate-100 text-slate-600">
                        {u.domicileBlock || "—"}{u.domicileNumber ? ` No. ${u.domicileNumber}` : ""}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="badge bg-emerald-100 text-emerald-700">
                        {u.familyMembers.length} orang
                      </span>
                    </td>
                    <td className="table-td">
                      <span className={`badge ${
                        u.hasKTPSukajaya === "ya"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {u.hasKTPSukajaya === "ya" ? "Ya" : "Belum"}
                      </span>
                    </td>
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
