import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";

const notificationActionSchema = z.union([
  z.object({ all: z.literal(true) }).strict(),
  z.object({ id: z.string().min(1).max(64) }).strict(),
]);

/** Mark notifications read (one or all). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const parsed = notificationActionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid notification action" }, { status: 400 });
  if ("all" in parsed.data) {
    await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
  } else {
    await prisma.notification.updateMany({ where: { id: parsed.data.id, userId: session.user.id }, data: { read: true } });
  }
  return NextResponse.json({ ok: true });
}
