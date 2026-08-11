import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { env } from "@sbgg/core";

export const metadata: Metadata = { title: "Log in", description: "Log in to Superbowl.gg" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configuration = env();
  const { error } = await searchParams;
  return <AuthForm mode="sign-in" googleEnabled={Boolean(configuration.AUTH_GOOGLE_ID && configuration.AUTH_GOOGLE_SECRET)} telegramBotUsername={configuration.TELEGRAM_BOT_USERNAME} initialError={error ? "Social sign-in could not be completed. Please try again." : undefined} />;
}
