"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export default function SubmitButton({ children, pendingText = "Menyimpan…", className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className ?? "btn btn-primary"}>
      {pending && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {pending ? pendingText : children}
    </button>
  );
}
