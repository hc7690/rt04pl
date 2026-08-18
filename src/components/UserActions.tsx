"use client";

import { useRouter } from "next/navigation";
import { deleteUser, updateUserRole, updateUserStatus } from "@/actions/users";
import ConfirmAction from "./ConfirmAction";

export default function UserActions({
  id,
  role,
  status,
  isSelf,
}: {
  id: string;
  role: string;
  status: string;
  isSelf: boolean;
}) {
  const router = useRouter();

  async function changeRole() {
    const next = role === "admin" ? "user" : "admin";
    if (!window.confirm(`Yakin ingin mengubah peran menjadi ${next === "admin" ? "Admin" : "Warga"}?`)) return;
    const result = await updateUserRole(id, next);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function toggleStatus() {
    const next = status === "active" ? "disabled" : "active";
    const result = await updateUserStatus(id, next);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={isSelf}
        onClick={changeRole}
        className="btn btn-secondary btn-sm"
        title={isSelf ? "Tidak dapat mengubah akun sendiri" : "Ubah peran"}
      >
        {role === "admin" ? "Jadikan Warga" : "Jadikan Admin"}
      </button>
      <button
        type="button"
        disabled={isSelf}
        onClick={toggleStatus}
        className={`btn btn-sm ${
          status === "active" ? "btn-danger" : "btn-primary"
        }`}
        title={isSelf ? "Tidak dapat mengubah akun sendiri" : "Ubah status"}
      >
        {status === "active" ? "Nonaktifkan" : "Aktifkan"}
      </button>
      <ConfirmAction
        action={deleteUser.bind(null, id)}
        label="Hapus"
        confirm={`Yakin ingin menghapus akun ini beserta seluruh datanya?`}
      />
    </div>
  );
}
