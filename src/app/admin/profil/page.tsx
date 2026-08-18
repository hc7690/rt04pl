import { getProfile } from "@/lib/utils";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminProfilPage() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Profil RT</h1>
      <p className="mt-1 text-slate-500 mb-6">
        Atur identitas, alamat, visi misi, logo, dan nama pengurus untuk tanda tangan laporan.
      </p>
      <ProfileForm initial={profile} />
    </div>
  );
}
