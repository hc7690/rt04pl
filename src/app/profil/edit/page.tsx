import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditWargaForm from "@/components/EditWargaForm";

export const dynamic = "force-dynamic";

export default async function EditProfilPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      familyMembers: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <EditWargaForm initial={user} />
    </div>
  );
}
