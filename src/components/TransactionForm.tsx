"use client";

import { useEffect, useState } from "react";
import type { ActionResult, TransactionInput } from "@/actions/finance";
import ImageUpload from "./ImageUpload";
import { IconAlert } from "./icons";

type Category = { id: string; name: string; type: string };

type Props = {
  categories: Category[];
  initial?: TransactionInput;
  action: (input: TransactionInput) => Promise<ActionResult>;
  submitLabel?: string;
  onSuccess?: () => void;
};

export default function TransactionForm({
  categories,
  initial,
  action,
  submitLabel = "Simpan Transaksi",
  onSuccess,
}: Props) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;

  const [type, setType] = useState(initial?.type ?? "pemasukan");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [date, setDate] = useState(initial?.date ?? todayStr);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [proofImage, setProofImage] = useState(initial?.proofImage ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (!filtered.some((c) => c.id === categoryId)) {
      setCategoryId(filtered[0]?.id ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await action({
        type,
        categoryId,
        amount: parseInt(amount, 10) || 0,
        description,
        date,
        proofImage,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (onSuccess) onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Jenis transaksi */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "pemasukan", label: "Pemasukan", cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
          { value: "pengeluaran", label: "Pengeluaran", cls: "border-red-300 bg-red-50 text-red-600" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setType(opt.value)}
            className={`rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition ${
              type === opt.value ? opt.cls : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="txn-category">
            Kategori
          </label>
          <select
            id="txn-category"
            className="input"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {filtered.length === 0 && <option value="">Belum ada kategori</option>}
            {filtered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="txn-amount">
            Nominal (Rp)
          </label>
          <input
            id="txn-amount"
            type="number"
            min={1}
            step={1}
            className="input"
            required
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="cth: 50000"
          />
        </div>
        <div>
          <label className="label" htmlFor="txn-date">
            Tanggal
          </label>
          <input
            id="txn-date"
            type="date"
            className="input"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="txn-desc">
            Keterangan
          </label>
          <input
            id="txn-desc"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="cth: Iuran warga bulan Juni"
          />
        </div>
      </div>

      <ImageUpload
        label="Bukti Transaksi (opsional)"
        value={proofImage}
        onChange={setProofImage}
      />

      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {loading ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}
