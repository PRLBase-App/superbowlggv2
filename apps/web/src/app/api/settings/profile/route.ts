import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

const profileSchema = z.object({
  bio: z.string().max(500).optional(),
  displayName: z.string().max(60).optional(),
  favoriteTeamId: z.string().max(64).optional(),
  email: z.email().max(320).optional(),
  currentPassword: z.string().max(1_000).optional(),
  newPassword: z.string().min(12).max(1_000).optional(),
}).strict();

/** Update own profile (bio, display name, favorite team) + account (email/password). */
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the profile fields and try again" }, { status: 400 });
  const { bio, displayName, favoriteTeamId, email, currentPassword, newPassword } = parsed.data;

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { auth } = await import("@sbgg/auth");
  if (newPassword) {
    try {
      await auth.api.changePassword({ body: { currentPassword: currentPassword ?? "", newPassword }, headers: new Headers(req.headers) });
    } catch {
      return NextResponse.json({ error: "Password change failed — check your current password" }, { status: 400 });
    }
  }

  let emailVerificationSent = false;
  if (email && email.toLowerCase() !== session.user.email.toLowerCase()) {
    try {
      await auth.api.changeEmail({ body: { newEmail: email.toLowerCase(), callbackURL: "/settings" }, headers: new Headers(req.headers) });
      emailVerificationSent = true;
    } catch {
      return NextResponse.json({ error: "Email change could not be started. The current email remains unchanged." }, { status: 400 });
    }
  }

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

  return NextResponse.json({ ok: true, emailVerificationSent });
}
