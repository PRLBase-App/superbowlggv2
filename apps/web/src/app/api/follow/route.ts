import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

const followSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/),
  follow: z.boolean(),
}).strict();

/** Follow / unfollow a user with notification on follow. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = followSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid follow action" }, { status: 400 });
  const { username, follow } = parsed.data;

  const target = await prisma.profile.findUnique({ where: { username } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.userId === session.user.id) return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });

  if (follow) {
    let created = false;
    try {
      await prisma.userFollow.create({ data: { followerId: session.user.id, followingId: target.userId } });
      created = true;
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    }
    const prefs = created ? await prisma.notificationPreference.findUnique({ where: { userId: target.userId } }) : null;
    if (created && (prefs?.newFollower ?? true)) {
      const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
      await prisma.notification.upsert({
        where: { dedupeKey: `follow:${session.user.id}:${target.userId}` },
        update: {},
        create: { userId: target.userId, type: "NEW_FOLLOWER", title: "New follower", body: `@${profile?.username ?? "someone"} started following you`, link: `/users/${profile?.username ?? "me"}`, dedupeKey: `follow:${session.user.id}:${target.userId}` },
      });
    }
  } else {
    await prisma.userFollow.deleteMany({ where: { followerId: session.user.id, followingId: target.userId } });
  }
  return NextResponse.json({ ok: true, following: !!follow });
}
