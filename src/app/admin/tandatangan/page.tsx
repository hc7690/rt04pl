import SignatureForm from "@/components/SignatureForm";
import { IconInfo } from "@/components/icons";
import { getSignatures } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminTandaTanganPage() {
  const signatures = await getSignatures();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Tanda Tangan &amp; Stempel</h1>
      <p className="mt-1 text-slate-500 mb-4">
        Unggah tanda tangan Ketua, Bendahara, dan stempel untuk dicetak pada laporan keuangan.
      </p>

      <div className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
        <IconInfo className="w-4 h-4 mt-0.5 shrink-0" />
        Hasilnya langsung terlihat pada halaman{" "}
        <a href="/laporan-keuangan" className="font-semibold underline underline-offset-2">
          Laporan Keuangan
        </a>{" "}
        saat dicetak / disimpan sebagai PDF. Nama di bawah tanda tangan mengikuti kolom
        &ldquo;Nama Ketua RT&rdquo; dan &ldquo;Nama Bendahara&rdquo; pada menu Profil RT.
      </div>

      <SignatureForm initial={signatures} />
    </div>
  );
}
