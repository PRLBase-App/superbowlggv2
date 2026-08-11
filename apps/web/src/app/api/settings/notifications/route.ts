import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

const notificationSettingsSchema = z.object({
  newFollower: z.boolean().optional(),
  followedUserPrediction: z.boolean().optional(),
  predictionSettled: z.boolean().optional(),
  achievementUnlocked: z.boolean().optional(),
  streakReward: z.boolean().optional(),
  referralReward: z.boolean().optional(),
  marketplace: z.boolean().optional(),
  system: z.boolean().optional(),
}).strict();

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const parsed = notificationSettingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification settings" }, { status: 400 });
  const body = parsed.data;
  await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: body,
    create: {
      userId: session.user.id,
      newFollower: body.newFollower ?? true,
      followedUserPrediction: body.followedUserPrediction ?? true,
      predictionSettled: body.predictionSettled ?? true,
      achievementUnlocked: body.achievementUnlocked ?? true,
      streakReward: body.streakReward ?? true,
      referralReward: body.referralReward ?? true,
      marketplace: body.marketplace ?? true,
      system: body.system ?? true,
    },
  });
  return NextResponse.json({ ok: true });
}
