import type { Metadata } from "next";
import { SocialAuthComplete } from "@/components/social-auth-complete";

export const metadata: Metadata = { title: "Complete account setup", robots: { index: false, follow: false } };

export default async function SocialCompletePage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <SocialAuthComplete referralCode={ref} />;
}
