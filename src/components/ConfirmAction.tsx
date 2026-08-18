"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { IconTrash } from "./icons";

function PendingButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-danger btn-sm">
      {pending ? (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <IconTrash className="w-3.5 h-3.5" />
      )}
      {pending ? "…" : label}
    </button>
  );
}

type Props = {
  // Server action (dapat mengembalikan hasil apa pun)
  action: () => Promise<unknown>;
  label?: string;
  confirm?: string;
};

export default function ConfirmAction({
  action,
  label = "Hapus",
  confirm = "Yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan.",
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={formRef}
      action={action as unknown as () => Promise<void>}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
    >
      <PendingButton label={label} />
    </form>
  );
}
