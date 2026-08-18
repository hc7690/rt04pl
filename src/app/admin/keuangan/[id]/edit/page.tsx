import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toDateInput } from "@/lib/utils";
import { updateTransaction } from "@/actions/finance";
import TransactionForm from "@/components/TransactionForm";

export const dynamic = "force-dynamic";

export default async function EditTransactionPage({ params }: { params: { id: string } }) {
  const [txn, categories] = await Promise.all([
    prisma.transaction.findUnique({ where: { id: params.id } }),
    prisma.financeCategory.findMany({ orderBy: [{ type: "asc" }, { sort: "asc" }] }),
  ]);
  if (!txn) notFound();

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Edit Transaksi</h1>
      <p className="mt-1 text-slate-500 mb-6">Perbarui data transaksi keuangan.</p>
      <div className="card p-6 sm:p-8 max-w-2xl">
        <TransactionForm
          categories={categories}
          action={(input) => updateTransaction(txn.id, input)}
          initial={{
            type: txn.type,
            categoryId: txn.categoryId,
            amount: txn.amount,
            description: txn.description ?? "",
            date: toDateInput(txn.date),
            proofImage: txn.proofImage ?? "",
          }}
          submitLabel="Perbarui Transaksi"
        />
      </div>
    </div>
  );
}
