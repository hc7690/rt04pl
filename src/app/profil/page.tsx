import Link from "next/link";
import { getProfile } from "@/lib/utils";
import { IconBuilding, IconHeart, IconMail, IconMapPin, IconPhone, IconShield } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getProfile();

  const contact = [
    { icon: <IconMapPin className="w-5 h-5" />, label: "Alamat", value: `${profile.alamat}, ${profile.kelurahan}, ${profile.kecamatan}, ${profile.kota}, ${profile.provinsi} ${profile.kodePos}` },
    { icon: <IconPhone className="w-5 h-5" />, label: "Telepon", value: profile.telepon },
    { icon: <IconMail className="w-5 h-5" />, label: "Email", value: profile.email },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 sm:px-10 py-10 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {profile.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logo}
                alt={profile.namaRT}
                className="h-20 w-20 rounded-2xl bg-white object-cover shadow-lg"
              />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-2xl font-extrabold backdrop-blur">
                RT
              </span>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">{profile.namaRT}</h1>
              <p className="mt-1 text-emerald-50/90">
                {profile.kelurahan}, {profile.kecamatan}, {profile.kota}, {profile.provinsi}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Tentang RT Kami</h2>
          <p className="text-slate-600 leading-relaxed">{profile.deskripsi}</p>
        </div>
      </div>

      {/* Visi Misi + Kontak */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="card p-6 border-l-4 border-l-emerald-500">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <IconShield className="w-5 h-5 text-emerald-600" />
            Visi
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">{profile.visi}</p>
        </div>
        <div className="card p-6 border-l-4 border-l-teal-500">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <IconHeart className="w-5 h-5 text-teal-600" />
            Misi
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed whitespace-pre-line">{profile.misi}</p>
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Kontak &amp; Alamat</h3>
          <ul className="space-y-4">
            {contact.map(
              (c, i) =>
                c.value && (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      {c.icon}
                    </span>
                    <span>
                      <span className="block text-xs text-slate-400">{c.label}</span>
                      {c.value}
                    </span>
                  </li>
                )
            )}
          </ul>
          <Link href="/profil/struktur" className="btn btn-secondary mt-6 w-full">
            <IconBuilding className="w-4 h-4" />
            Lihat Struktur Organisasi
          </Link>
        </div>
      </div>
    </div>
  );
}
