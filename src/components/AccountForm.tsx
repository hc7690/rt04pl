"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAccount } from "@/actions/account";
import { IconAlert, IconCheckCircle } from "./icons";

export default function AccountForm({ email }: { email: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const result = await updateAccount({
        currentPassword,
        email: newEmail,
        newPassword: newPassword || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess("Akun berhasil diperbarui. Gunakan email baru saat login berikutnya.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <IconAlert className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <IconCheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {success}
        </div>
      )}

      <div className="grid gap-5">
        <div>
          <label className="label">Email login <span className="text-red-500">*</span></label>
          <input
            type="email"
            className="input"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password saat ini <span className="text-red-500">*</span></label>
          <input
            type="password"
            className="input"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password baru (kosongkan jika tidak diganti)</label>
          <input
            type="password"
            className="input"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Ulangi password baru</label>
          <input
            type="password"
            className="input"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          )}
          {loading ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}
