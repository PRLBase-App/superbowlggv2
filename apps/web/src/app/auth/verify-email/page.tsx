import type { Metadata } from "next";
import { VerificationComplete } from "@/components/verification-complete";

export const metadata: Metadata = { title: "Verify email", robots: { index: false, follow: false } };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ ref?: string; error?: string }> }) {
  const { ref, error } = await searchParams;
  return <VerificationComplete referralCode={ref} verificationError={error} />;
}
