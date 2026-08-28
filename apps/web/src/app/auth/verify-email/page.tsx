import type { Metadata } from "next";
import { VerificationComplete } from "@/components/verification-complete";
import { safeReturnTo } from "@/lib/return-url";

export const metadata: Metadata = { title: "Verify email", robots: { index: false, follow: false } };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ ref?: string; error?: string; next?: string }> }) {
  const { ref, error, next } = await searchParams;
  return <VerificationComplete referralCode={ref} verificationError={error} returnTo={safeReturnTo(next, "/")} />;
}
