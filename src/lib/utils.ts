import { prisma } from "./prisma";

const DEFAULT_PROFILE = {
  namaRT: "RT 05 / RW 03",
  alamat: "",
  kelurahan: "",
  kecamatan: "",
  kota: "",
  provinsi: "",
  kodePos: "",
  telepon: "",
  email: "",
  logo: "",
  deskripsi: "",
  visi: "",
  misi: "",
  ketuaName: "",
  bendaharaName: "",
};

export type Profile = typeof DEFAULT_PROFILE;

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Format a Date into yyyy-mm-dd for <input type="date"> using local time. */
export function toDateInput(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a yyyy-mm-dd input value into a local-midnight Date. */
export function parseDateInput(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + "…";
}

export const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function monthNameId(month: number): string {
  return MONTHS_ID[month - 1] ?? "";
}

export async function getProfile(): Promise<Profile> {
  const setting = await prisma.setting.findUnique({ where: { key: "profile" } });
  if (!setting) return DEFAULT_PROFILE;
  try {
    return { ...DEFAULT_PROFILE, ...JSON.parse(setting.value) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

const DEFAULT_SIGNATURES = {
  ketua: "",
  bendahara: "",
  stamp: "",
};

export type Signatures = typeof DEFAULT_SIGNATURES;

/** Tanda tangan ketua/bendahara + stempel untuk cetak laporan. */
export async function getSignatures(): Promise<Signatures> {
  const setting = await prisma.setting.findUnique({ where: { key: "signatures" } });
  if (!setting) return DEFAULT_SIGNATURES;
  try {
    return { ...DEFAULT_SIGNATURES, ...JSON.parse(setting.value) };
  } catch {
    return DEFAULT_SIGNATURES;
  }
}
