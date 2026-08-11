import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

/** Update own profile (bio, display name, favorite team) + account (email/password). */
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { bio, displayName, favoriteTeamId, email, currentPassword, newPassword } = body as {
    bio?: string;
    displayName?: string;
    favoriteTeamId?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (bio != null || displayName != null || favoriteTeamId != null) {
    await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(bio != null ? { bio: bio.slice(0, 500) } : {}),
        ...(displayName != null ? { displayName: displayName.slice(0, 60) || null } : {}),
      },
    });
    if (favoriteTeamId != null) {
      await prisma.userFavoriteTeam.deleteMany({ where: { userId: session.user.id } });
      if (favoriteTeamId) {
        await prisma.userFavoriteTeam.create({ data: { userId: session.user.id, teamId: favoriteTeamId } });
      }
    }
  }

  if (newPassword) {
    const { auth } = await import("@sbgg/auth");
    const ok = await auth.api.changePassword({ body: { currentPassword: currentPassword ?? "", newPassword }, headers: new Headers(req.headers) });
    if (!ok) return NextResponse.json({ error: "Password change failed — check your current password" }, { status: 400 });
  }

  if (email && email !== session.user.email) {
    await prisma.user.update({ where: { id: session.user.id }, data: { email } });
  }

  return NextResponse.json({ ok: true });
}
