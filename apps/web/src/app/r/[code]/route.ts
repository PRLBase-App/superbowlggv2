import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";

const REFERRAL_COOKIE = "sbgg_ref";
const REFERRAL_MAX_AGE = 30 * 24 * 60 * 60;

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params;
  const code = rawCode.trim().toUpperCase();
  const destination = new URL("/auth/sign-up", request.url);

  if (!/^[A-Z0-9_-]{3,64}$/.test(code)) return NextResponse.redirect(destination, 302);

  const referral = await prisma.referral.findUnique({ where: { code }, select: { id: true } });
  if (!referral) return NextResponse.redirect(destination, 302);

  destination.searchParams.set("ref", code);
  if (request.cookies.get(REFERRAL_COOKIE)?.value !== code) {
    await prisma.referral.update({ where: { id: referral.id }, data: { clicks: { increment: 1 } } });
  }

  const response = NextResponse.redirect(destination, 302);
  response.cookies.set(REFERRAL_COOKIE, code, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFERRAL_MAX_AGE,
    path: "/",
  });
  return response;
}
