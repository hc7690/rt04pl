import Link from "next/link";
import { getProfile } from "@/lib/utils";
import { IconMail, IconMapPin, IconPhone } from "./icons";

export default async function Footer() {
  const profile = await getProfile();

  return (
    <footer className="no-print border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-slate-900 mb-3">{profile.namaRT}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.deskripsi}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Tautan</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/artikel" className="text-slate-600 hover:text-emerald-700">
                  Artikel &amp; Pengumuman
                </Link>
              </li>
              <li>
                <Link href="/profil" className="text-slate-600 hover:text-emerald-700">
                  Profil RT
                </Link>
              </li>
              <li>
                <Link href="/profil/struktur" className="text-slate-600 hover:text-emerald-700">
                  Struktur Organisasi
                </Link>
              </li>
              <li>
                <Link href="/daftar" className="text-slate-600 hover:text-emerald-700">
                  Registrasi Warga
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-3">Kontak</h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <IconMapPin className="w-4 h-4 mt-0.5 text-emerald-600 shrink-0" />
                <span>
                  {profile.alamat}, {profile.kelurahan}, {profile.kecamatan}, {profile.kota},{" "}
                  {profile.provinsi} {profile.kodePos}
                </span>
              </li>
              {profile.telepon && (
                <li className="flex items-center gap-2">
                  <IconPhone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profile.telepon}</span>
                </li>
              )}
              {profile.email && (
                <li className="flex items-center gap-2">
                  <IconMail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{profile.email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} {profile.namaRT} — Dibangun dengan gotong royong untuk warga.
        </div>
      </div>
    </footer>
  );
}
