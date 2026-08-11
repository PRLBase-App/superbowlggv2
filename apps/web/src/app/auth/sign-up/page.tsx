import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Join Free", description: "Create your Superbowl.gg account and get 1000 free coins." };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <AuthForm mode="sign-up" initialRef={ref} />;
}
