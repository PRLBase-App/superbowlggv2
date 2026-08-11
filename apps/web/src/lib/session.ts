import { headers } from "next/headers";
import { auth } from "@sbgg/auth";
import { prisma } from "@sbgg/db";

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true, isAdmin: true, emailVerified: true },
  });
  if (!user || user.status !== "ACTIVE" || !user.emailVerified) return null;
  return { ...session, user: { ...session.user, ...user } };
}

export interface SessionUserView {
  id: string;
  name?: string | null;
  email: string;
  username?: string;
  coins: number;
  role: string;
  isAdmin: boolean;
}

/** Session + wallet snapshot for the header. */
export async function getSessionUser(): Promise<SessionUserView | null> {
  const session = await getSession();
  if (!session?.user) return null;
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    username: profile?.username,
    coins: wallet?.balance ?? 0,
    role: session.user.role,
    isAdmin: session.user.isAdmin,
  };
}

/** Require a session or redirect (server components / route handlers). */
export async function requireSession(redirectTo = "/auth/sign-in"): Promise<NonNullable<Awaited<ReturnType<typeof getSession>>>> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect(redirectTo);
    throw new Error("unreachable");
  }
  return session;
}

export async function requireAdmin(): Promise<NonNullable<Awaited<ReturnType<typeof getSession>>>> {
  const session = await requireSession();
  if (!session.user.isAdmin && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    const { redirect } = await import("next/navigation");
    redirect("/");
    throw new Error("unreachable");
  }
  return session;
}
