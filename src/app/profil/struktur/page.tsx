import { prisma } from "@/lib/prisma";
import { getProfile } from "@/lib/utils";
import { IconPhone } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StrukturPage() {
  const [profile, members] = await Promise.all([
    getProfile(),
    prisma.orgMember.findMany({ where: { active: true }, orderBy: [{ group: "asc" }, { sort: "asc" }] }),
  ]);

  const groups = members.reduce<Record<string, typeof members>>((acc, m) => {
    (acc[m.group] = acc[m.group] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-extrabold text-slate-900">Struktur Organisasi</h1>
        <p className="mt-2 text-slate-500">
          Susunan pengurus {profile.namaRT} periode berjalan.
        </p>
      </div>

      {Object.keys(groups).length === 0 ? (
        <div className="card mt-8 p-12 text-center text-slate-500">
          Struktur organisasi belum diisi oleh admin.
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {Object.entries(groups).map(([group, list]) => (
            <div key={group}>
              <h2 className="mb-4 inline-flex items-center rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-bold text-emerald-800">
                {group}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    <div className="min-w-0">
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
