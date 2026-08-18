import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberForm from "@/components/MemberForm";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({ params }: { params: { id: string } }) {
  const [member, allMembers] = await Promise.all([
    prisma.orgMember.findUnique({ where: { id: params.id } }),
    prisma.orgMember.findMany({ select: { group: true }, distinct: ["group"] }),
  ]);
  if (!member) notFound();

  const groups = allMembers.map((m) => m.group);

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-slate-900">Edit Pengurus</h1>
      <p className="mt-1 text-slate-500 mb-6">Perbarui data pengurus RT.</p>
      <div className="card p-6 sm:p-8 max-w-2xl">
        <MemberForm
          groups={groups}
          initial={{
            id: member.id,
            group: member.group,
            position: member.position,
            name: member.name,
            photo: member.photo ?? "",
            phone: member.phone ?? "",
            sort: member.sort,
            active: member.active,
          }}
          submitLabel="Perbarui Data"
          redirectTo="/admin/struktur"
        />
      </div>
    </div>
  );
}
