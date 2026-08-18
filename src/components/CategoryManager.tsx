"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory, updateCategory } from "@/actions/finance";
import ConfirmAction from "./ConfirmAction";
import { IconAlert, IconCheck, IconPencil, IconPlus, IconX } from "./icons";

type Category = { id: string; name: string; type: string; sort: number };

export default function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [newName, setNewName] = useState<Record<string, string>>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function addCategory(type: string) {
    const name = (newName[type] || "").trim();
    if (!name) return;
    setError("");
    setLoading(true);
    try {
      const result = await createCategory({ name, type });
      if (!result.ok) setError(result.error);
      else {
        setNewName((s) => ({ ...s, [type]: "" }));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(type: string) {
    if (!editId) return;
    const name = editName.trim();
    if (!name) return;
    setError("");
    const result = await updateCategory(editId, { name, type });
    if (!result.ok) setError(result.error);
    else {
      setEditId(null);
      router.refresh();
    }
  }

  const types = [
    { value: "pemasukan", label: "Kategori Pemasukan", accent: "emerald" },
    { value: "pengeluaran", label: "Kategori Pengeluaran", accent: "red" },
  ];

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {types.map((t) => {
          const list = categories
            .filter((c) => c.type === t.value)
            .sort((a, b) => a.sort - b.sort);
          return (
            <div key={t.value} className="card p-5">
              <h2 className="font-bold text-slate-900 mb-4">{t.label}</h2>

              {/* Add form */}
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Nama kategori baru…"
                  value={newName[t.value] || ""}
                  onChange={(e) => setNewName((s) => ({ ...s, [t.value]: e.target.value }))}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => addCategory(t.value)}
                  className="btn btn-primary shrink-0"
                >
                  <IconPlus className="w-4 h-4" />
                  Tambah
                </button>
              </div>

              {/* List */}
              <ul className="mt-4 divide-y divide-slate-100">
                {list.length === 0 && (
                  <li className="py-4 text-sm text-slate-400 text-center">Belum ada kategori.</li>
                )}
                {list.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                    {editId === c.id ? (
                      <div className="flex flex-1 gap-2">
                        <input
                          className="input !py-1.5"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-primary btn-sm shrink-0"
                          onClick={() => saveEdit(t.value)}
                        >
                          <IconCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm shrink-0"
                          onClick={() => setEditId(null)}
                        >
                          <IconX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-slate-800">{c.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm !px-2.5"
                            title="Ubah nama"
                            onClick={() => {
                              setEditId(c.id);
                              setEditName(c.name);
                            }}
                          >
                            <IconPencil className="w-3.5 h-3.5" />
                          </button>
                          <ConfirmAction
                            action={deleteCategory.bind(null, c.id)}
                            label="Hapus"
                          />
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
