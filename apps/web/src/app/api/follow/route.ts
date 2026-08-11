import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

/** Follow / unfollow a user with notification on follow. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { username, follow } = body as { username?: string; follow?: boolean };
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const target = await prisma.profile.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.userId === session.user.id) return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });

  if (follow) {
    await prisma.userFollow.upsert({
      where: { followerId_followingId: { followerId: session.user.id, followingId: target.userId } },
      update: {},
      create: { followerId: session.user.id, followingId: target.userId },
    });
    const prefs = await prisma.notificationPreference.findUnique({ where: { userId: target.userId } });
    if (prefs?.newFollower ?? true) {
      const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
      await prisma.notification.create({
        data: { userId: target.userId, type: "NEW_FOLLOWER", title: "New follower", body: `@${profile?.username ?? "someone"} started following you`, link: `/users/${profile?.username ?? "me"}` },
      });
    }
  } else {
    await prisma.userFollow.deleteMany({ where: { followerId: session.user.id, followingId: target.userId } });
  }
  return NextResponse.json({ ok: true, following: !!follow });
}
