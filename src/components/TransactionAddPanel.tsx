"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransaction, type TransactionInput } from "@/actions/finance";
import TransactionForm from "./TransactionForm";
import { IconPlus, IconX } from "./icons";

type Category = { id: string; name: string; type: string };

export default function TransactionAddPanel({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
    setOpen(false);
  }

  return (
    <div className="card p-5">
      {open ? (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Tambah Transaksi Baru</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              <IconX className="w-4 h-4" />
              Tutup
            </button>
          </div>
          <TransactionForm
            categories={categories}
            action={(input: TransactionInput) => createTransaction(input)}
            onSuccess={handleSuccess}
            submitLabel="Simpan Transaksi"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-primary w-full"
        >
          <IconPlus className="w-4 h-4" />
          Tambah Transaksi
        </button>
      )}
    </div>
  );
}
