"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MemberForm from "./MemberForm";
import { IconPlus, IconX } from "./icons";

export default function MemberAddPanel({
  groups,
  users,
}: {
  groups: string[];
  users: { id: string; name: string }[];
}) {
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
            <h2 className="font-bold text-slate-900">Tambah Pengurus Baru</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary btn-sm"
            >
              <IconX className="w-4 h-4" />
              Tutup
            </button>
          </div>
          <MemberForm groups={groups} users={users} onSuccess={handleSuccess} />
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-primary w-full">
          <IconPlus className="w-4 h-4" />
          Tambah Pengurus
        </button>
      )}
    </div>
  );
}
