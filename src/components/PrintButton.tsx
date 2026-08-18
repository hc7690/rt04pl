"use client";

import { IconPrinter } from "./icons";

export default function PrintButton({ label = "Cetak / Simpan PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary">
      <IconPrinter className="w-4 h-4" />
      {label}
    </button>
  );
}
