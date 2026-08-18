import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteMember } from "@/actions/struktur";
import MemberAddPanel from "@/components/MemberAddPanel";
import ConfirmAction from "@/components/ConfirmAction";
import { IconPencil, IconPhone } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminStrukturPage() {
  const members = await prisma.orgMember.findMany({
    orderBy: [{ group: "asc" }, { sort: "asc" }],
  });
  const groups = Array.from(new Set(members.map((m) => m.group)));

  const grouped = members.reduce<Record<string, typeof members>>((acc, m) => {
    (acc[m.group] = acc[m.group] || []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Struktur Organisasi</h1>
      <p className="mt-1 text-slate-500 mb-6">
        Kelola susunan pengurus RT yang tampil di halaman publik.
      </p>

      <MemberAddPanel groups={groups} />

      <div className="mt-5 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <p className="card p-10 text-center text-sm text-slate-400">
            Belum ada pengurus. Tambahkan melalui tombol di atas.
          </p>
        )}
        {Object.entries(grouped).map(([group, list]) => (
          <div key={group}>
            <h2 className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800">
              {group}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((m) => (
                <div key={m.id} className="card flex items-center gap-4 p-5">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.photo}
                      alt={m.name}
                      className="h-14 w-14 shrink-0 rounded-full object-cover border-2 border-emerald-100"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white">
                      {m.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      {m.position}
                    </p>
                    <p className="truncate font-bold text-slate-900">{m.name}</p>
                    {m.phone && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <IconPhone className="w-3 h-3" />
                        {m.phone}
                      </p>
                    )}
                    {!m.active && (
                      <span className="badge mt-1 bg-amber-100 text-amber-700">Tidak tampil</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Link
                      href={`/admin/struktur/${m.id}/edit`}
                      className="btn btn-secondary btn-sm"
                    >
                      <IconPencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <ConfirmAction action={deleteMember.bind(null, m.id)} label="Hapus" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
