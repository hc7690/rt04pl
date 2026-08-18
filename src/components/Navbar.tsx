import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProfile } from "@/lib/utils";
import NavMenu from "./NavMenu";

export default async function Navbar() {
  const [session, profile] = await Promise.all([getServerSession(authOptions), getProfile()]);
  const user = session?.user
    ? { name: session.user.name, email: session.user.email, role: session.user.role }
    : null;

  return <NavMenu rtName={profile.namaRT} logo={profile.logo} user={user} />;
}
