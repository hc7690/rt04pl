import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import UserActions from "@/components/UserActions";
import { IconArrowLeft, IconEye } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminWargaDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) notFound();

  const rows: Array<[string, string]> = [
    ["NIK", user.nik || "—"],
    [
      "Tempat, Tanggal Lahir",
      user.dateOfBirth
        ? `${user.placeOfBirth || "—"}, ${formatDate(user.dateOfBirth)}`
        : user.placeOfBirth || "—",
    ],
    ["Jenis Kelamin", user.gender || "—"],
    ["Alamat", user.address || "—"],
    ["RT / RW", user.rtRw || "—"],
    ["Kelurahan", user.kelurahan || "—"],
    ["Kecamatan", user.kecamatan || "—"],
    ["Kota / Kabupaten", user.city || "—"],
    ["Provinsi", user.province || "—"],
    ["Kode Pos", user.postalCode || "—"],
    ["Agama", user.religion || "—"],
    ["Status Perkawinan", user.maritalStatus || "—"],
    ["Pekerjaan", user.occupation || "—"],
    ["Kewarganegaraan", user.nationality || "—"],
    ["No. HP / WA", user.phone || "—"],
    ["Email", user.email],
    ["Terdaftar", formatDateTime(user.createdAt)],
    ["Terakhir diperbarui", formatDateTime(user.updatedAt)],
  ];

  return (
    <div>
      <Link
        href="/admin/warga"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-700"
      >
        <IconArrowLeft className="w-4 h-4" />
        Kembali ke Data Warga
      </Link>

      <div className="card mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 sm:px-8 py-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-extrabold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="text-xl font-extrabold">{user.name}</h1>
                <p className="text-sm text-emerald-100">{user.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`badge ${
                  user.role === "admin" ? "bg-violet-400/30 text-violet-100" : "bg-white/20 text-white"
                }`}
              >
                {user.role === "admin" ? "Admin" : "Warga"}
              </span>
              <span
                className={`badge ${
                  user.status === "active" ? "bg-emerald-900/40 text-emerald-100" : "bg-red-900/40 text-red-100"
                }`}
              >
                {user.status === "active" ? "Aktif" : "Nonaktif"}
              </span>
              <Link
                href={`/warga/${user.id}`}
                className="btn btn-secondary btn-sm !bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
              >
                <IconEye className="w-4 h-4" />
                Lihat sebagai publik
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-8 px-6 sm:px-8 py-6 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="font-bold text-slate-900">Data Lengkap Warga</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              {rows.map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-sm text-slate-500 shrink-0">{label}</dt>
                  <dd className="text-sm font-medium text-slate-800 text-right">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              <UserActions
                id={user.id}
                role={user.role}
                status={user.status}
                isSelf={user.id === session?.user.id}
              />
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900 mb-3">Foto KTP</h2>
            {user.ktpPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/ktp/${user.id}`}
                alt={`Foto KTP ${user.name}`}
                className="w-full rounded-xl border border-slate-200 shadow-sm"
              />
            ) : (
              <p className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                Belum ada foto KTP.
              </p>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Foto KTP hanya dapat dilihat oleh admin dan pemilik akun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
