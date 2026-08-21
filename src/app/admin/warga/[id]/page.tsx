import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDateTime } from "@/lib/utils";
import UserActions from "@/components/UserActions";
import AdminEditUserForm from "@/components/AdminEditUserForm";
import { IconArrowLeft, IconEye } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminWargaDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: { familyMembers: { orderBy: { createdAt: "asc" } } },
  });
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
    ["Blok Domisili", user.domicileBlock || "—"],
    ["No. Rumah", user.domicileNumber || "—"],
    ["Status Kepemilikan Rumah", user.houseOwnership || "-"],
    ["Alamat Sesuai KTP", user.ktpAddress || "-"],
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
    ["KTP Sukajaya", user.hasKTPSukajaya === "ya" ? "Ya" : "Belum"],
    ["Profil", user.profileVisibility === "private" ? "Privat" : "Publik"],
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

            {/* Anggota KK */}
            <h2 className="mt-8 font-bold text-slate-900">
              Anggota Kartu Keluarga ({user.familyMembers.length} orang)
            </h2>
            {user.familyMembers.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {user.familyMembers.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        m.isDeceased
                          ? "bg-slate-200 text-slate-500"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          m.isDeceased ? "text-slate-400 line-through" : "text-slate-800"
                        }`}>
                          {m.name}
                        </p>
                        <p className="text-xs text-slate-400">{m.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.religion && (
                        <span className="badge bg-slate-100 text-slate-600 text-xs">{m.religion}</span>
                      )}
                      {m.isDeceased && (
                        <span className="badge bg-red-100 text-red-600 text-xs">Meninggal</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Belum ada anggota KK yang didaftarkan.</p>
            )}

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

      {/* Form Edit oleh Admin */}
      <div className="mt-6">
        <AdminEditUserForm
          user={{
            id: user.id,
          email: user.email || "",
            name: user.name,
            phone: user.phone || "",
            occupation: user.occupation || "",
            gender: user.gender || "",
            religion: user.religion || "",
            maritalStatus: user.maritalStatus || "",
        houseOwnership: user.houseOwnership || "",
            address: user.address || "",
        ktpAddress: user.ktpAddress || "",
            domicileBlock: user.domicileBlock || "",
            domicileNumber: user.domicileNumber || "",
            hasKTPSukajaya: user.hasKTPSukajaya || "belum",
            profileVisibility: user.profileVisibility || "public",
            status: user.status,
            role: user.role,
          }}
          familyMembers={user.familyMembers.map((m) => ({
            id: m.id,
            name: m.name,
            status: m.status,
            religion: m.religion || "",
            isDeceased: m.isDeceased,
          }))}
        />
      </div>
    </div>
  );
}
