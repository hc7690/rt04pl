import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/CategoryManager";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  const categories = await prisma.financeCategory.findMany({
    orderBy: [{ type: "asc" }, { sort: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Kategori Keuangan</h1>
      <p className="mt-1 text-slate-500 mb-6">
        Atur kategori pemasukan dan pengeluaran yang tersedia saat mencatat transaksi.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}
