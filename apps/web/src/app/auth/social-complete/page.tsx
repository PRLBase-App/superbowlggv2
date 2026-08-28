import type { Metadata } from "next";
import { SocialAuthComplete } from "@/components/social-auth-complete";
import { safeReturnTo } from "@/lib/return-url";

export const metadata: Metadata = { title: "Complete account setup", robots: { index: false, follow: false } };

export default async function SocialCompletePage({ searchParams }: { searchParams: Promise<{ ref?: string; next?: string }> }) {
  const { ref, next } = await searchParams;
  return <SocialAuthComplete referralCode={ref} returnTo={safeReturnTo(next, "/")} />;
}
