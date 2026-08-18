import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AccountForm from "@/components/AccountForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Akun Admin</h1>
      <p className="mt-1 text-sm text-slate-500">
        Ganti email dan password login admin. Perubahan langsung disimpan di database lokal
        dan otomatis tersinkron ke Firebase (jika sudah dikonfigurasi).
      </p>
      <div className="mt-6">
        <AccountForm email={session.user.email ?? ""} />
      </div>
    </div>
  );
}
