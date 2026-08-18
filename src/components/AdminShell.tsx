"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  IconBuilding,
  IconCloud,
  IconDashboard,
  IconDocument,
  IconLogout,
  IconLock,
  IconMenu,
  IconPenLine,
  IconPrinter,
  IconSettings,
  IconUsers,
  IconWallet,
  IconX,
} from "./icons";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: <IconDashboard className="w-5 h-5" /> },
  { href: "/admin/artikel", label: "Artikel", icon: <IconDocument className="w-5 h-5" /> },
  { href: "/admin/keuangan", label: "Keuangan", icon: <IconWallet className="w-5 h-5" /> },
  { href: "/admin/keuangan/kategori", label: "Kategori Keuangan", icon: <IconSettings className="w-5 h-5" /> },
  { href: "/laporan-keuangan", label: "Laporan & Cetak PDF", icon: <IconPrinter className="w-5 h-5" /> },
  { href: "/admin/profil", label: "Profil RT", icon: <IconBuilding className="w-5 h-5" /> },
  { href: "/admin/struktur", label: "Struktur Organisasi", icon: <IconUsers className="w-5 h-5" /> },
  { href: "/admin/warga", label: "Data Warga", icon: <IconUsers className="w-5 h-5" /> },
  { href: "/admin/tandatangan", label: "Tanda Tangan & Stempel", icon: <IconPenLine className="w-5 h-5" /> },
  { href: "/admin/akun", label: "Akun Admin", icon: <IconLock className="w-5 h-5" /> },
  { href: "/admin/sinkronisasi", label: "Sinkronisasi Firebase", icon: <IconCloud className="w-5 h-5" /> },
];

export default function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
            isActive(item.href)
              ? "bg-emerald-600 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
        {/* Sidebar desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <div className="card p-4">
              <div className="mb-3 px-3.5 pt-1 pb-3 border-b border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Menu Admin</p>
                <p className="mt-1 truncate text-sm font-semibold text-slate-900">{user.name}</p>
              </div>
              {nav}
              <div className="mt-3 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <IconLogout className="w-5 h-5" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="mt-4 lg:mt-0">
          {/* Mobile top bar */}
          <div className="lg:hidden mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="btn btn-secondary !px-3 !py-2"
              aria-label="Buka menu admin"
            >
              <IconMenu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-slate-700">{user.name}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="btn btn-secondary !px-3 !py-2 text-red-600"
              aria-label="Keluar"
            >
              <IconLogout className="w-5 h-5" />
            </button>
          </div>

          {children}
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-bold text-slate-900">Menu Admin</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-secondary !px-2.5 !py-2"
                aria-label="Tutup menu"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      )}
    </div>
  );
}
