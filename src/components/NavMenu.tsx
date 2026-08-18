"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { IconChevronDown, IconLogout, IconMenu, IconX } from "./icons";

export type NavUser = { name: string; email: string; role: string } | null;

const LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/artikel", label: "Artikel" },
  { href: "/profil", label: "Profil RT" },
  { href: "/profil/struktur", label: "Struktur" },
];

export default function NavMenu({ rtName, logo, user }: { rtName: string; logo: string; user: NavUser }) {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const authLinks = user ? (
    <>
      <Link
        href={user.role === "admin" ? "/admin" : "/dashboard"}
        className="btn btn-primary"
        onClick={() => setOpen(false)}
      >
        {user.role === "admin" ? "Panel Admin" : "Dashboard"}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="btn btn-secondary"
      >
        <IconLogout className="w-4 h-4" />
        Keluar
      </button>
    </>
  ) : (
    <>
      <Link href="/login" className="btn btn-secondary" onClick={() => setOpen(false)}>
        Masuk
      </Link>
      <Link href="/daftar" className="btn btn-primary" onClick={() => setOpen(false)}>
        Daftar Warga
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 no-print">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 min-w-0">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={rtName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-sm font-bold shadow-sm">
                  RT
                </span>
              )}
              <span className="truncate text-sm sm:text-base font-bold text-slate-900">
                {rtName}
              </span>
            </Link>

            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-1">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive(l.href)
                      ? "text-emerald-700 bg-emerald-50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/warga"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/warga")
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Warga
                  </Link>
                  <Link
                    href="/laporan-keuangan"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive("/laporan-keuangan")
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    Laporan Keuangan
                  </Link>
                </>
              )}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserOpen(!userOpen)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[140px] truncate">{user.name}</span>
                    <IconChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {userOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="badge bg-emerald-100 text-emerald-700 mt-1">
                          {user.role === "admin" ? "Admin" : "Warga"}
                        </span>
                      </div>
                      <Link
                        href={user.role === "admin" ? "/admin" : "/dashboard"}
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserOpen(false)}
                      >
                        {user.role === "admin" ? "Panel Admin" : "Dashboard Saya"}
                      </Link>
                      <Link
                        href="/laporan-keuangan"
                        className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setUserOpen(false)}
                      >
                        Laporan Keuangan
                      </Link>
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
                      >
                        <IconLogout className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                authLinks
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden btn btn-secondary !px-2.5 !py-2"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <IconX className="w-5 h-5" /> : <IconMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden border-b border-slate-200 bg-white shadow-sm">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(l.href) ? "text-emerald-700 bg-emerald-50" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href="/warga"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Warga
                </Link>
                <Link
                  href="/laporan-keuangan"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Laporan Keuangan
                </Link>
              </>
            )}
            <div className="border-t border-slate-100 mt-2 pt-3 flex flex-col gap-2">
              {authLinks}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
