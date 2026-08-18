import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  IconAlert,
  IconArrowLeft,
  IconLock,
  IconMapPin,
  IconShield,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function WargaProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  const isOwner = session.user.id === user.id;
  const isAdmin = session.user.role === "admin";
  const fullAccess = isOwner || isAdmin;

  // Warga nonaktif hanya bisa dilihat oleh admin atau pemilik akun
  if (user.status !== "active" && !fullAccess) notFound();

  const basicRows: Array<[string, string]> = [
    ["Jenis Kelamin", user.gender || "—"],
    ["Alamat", user.address || "—"],
    ["RT / RW", user.rtRw || "—"],
    ["Kelurahan", user.kelurahan || "—"],
    ["Kecamatan", user.kecamatan || "—"],
    ["Kota / Kabupaten", user.city || "—"],
    ["Provinsi", user.province || "—"],
    ["Pekerjaan", user.occupation || "—"],
  ];

  const privateRows: Array<[string, string]> = [
    ["NIK", user.nik || "—"],
    [
      "Tempat, Tanggal Lahir",
      user.dateOfBirth
        ? `${user.placeOfBirth || "—"}, ${formatDate(user.dateOfBirth)}`
        : user.placeOfBirth || "—",
    ],
    ["Agama", user.religion || "—"],
    ["Status Perkawinan", user.maritalStatus || "—"],
    ["Kewarganegaraan", user.nationality || "—"],
    ["No. HP / WA", user.phone || "—"],
    ["Email", user.email],
    ["Kode Pos", user.postalCode || "—"],
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
      <Link
        href="/warga"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <IconArrowLeft className="w-4 h-4" />
        Kembali ke Direktori Warga
      </Link>

      {/* Kartu identitas */}
      <div className="card mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 sm:px-8 py-8 text-white">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-extrabold truncate">{user.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-100">
                <IconMapPin className="w-4 h-4 shrink-0" />
                {user.rtRw ? `RT ${user.rtRw}` : "Warga"} · {user.kelurahan || user.city || "RT"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge bg-white/20 text-white">
              {user.role === "admin" ? "Admin RT" : "Warga"}
            </span>
            <span
              className={`badge ${
                user.status === "active" ? "bg-emerald-900/40 text-emerald-100" : "bg-red-900/40 text-red-100"
              }`}
            >
              {user.status === "active" ? "Aktif" : "Nonaktif"}
            </span>
            {isOwner && <span className="badge bg-white/20 text-white">Ini Anda</span>}
          </div>
        </div>

        {/* Data dasar */}
        <div className="px-6 sm:px-8 py-6">
          <h2 className="font-bold text-slate-900">Data Dasar</h2>
          <dl className="mt-4 divide-y divide-slate-100">
            {basicRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
                <dd className="text-sm font-medium text-slate-800 text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Data sensitif — hanya admin & pemilik */}
          {fullAccess ? (
            <>
              <h2 className="mt-8 font-bold text-slate-900">Data Pribadi (sensitif)</h2>
              <dl className="mt-4 divide-y divide-slate-100">
                {privateRows.map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
                    <dd className="text-sm font-medium text-slate-800 text-right">{value}</dd>
                  </div>
                ))}
              </dl>

              {user.ktpPhoto && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700 mb-2">Foto KTP</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/ktp/${user.id}`}
                    alt={`Foto KTP ${user.name}`}
                    className="max-w-sm rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="mt-8 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-500">
              <IconLock className="w-4 h-4 mt-0.5 shrink-0" />
              Data sensitif seperti NIK, nomor HP, email, dan foto KTP hanya dapat dilihat
              oleh admin dan pemilik akun.
            </div>
          )}
        </div>
      </div>

      {isAdmin && (
        <Link href={`/admin/warga/${user.id}`} className="btn btn-secondary mt-4">
          <IconShield className="w-4 h-4" />
          Kelola di Panel Admin
        </Link>
      )}
      {isOwner && user.status !== "active" && (
        <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          Akun Anda sedang dinonaktifkan oleh admin. Hubungi pengurus RT untuk mengaktifkannya kembali.
        </div>
      )}
    </div>
  );
}
