import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { env } from "@sbgg/core";

export const metadata: Metadata = { title: "Join Free", description: "Create your Superbowl.gg account and get 1000 free coins." };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const configuration = env();
  return <AuthForm mode="sign-up" initialRef={ref} googleEnabled={Boolean(configuration.AUTH_GOOGLE_ID && configuration.AUTH_GOOGLE_SECRET)} telegramBotUsername={configuration.TELEGRAM_BOT_USERNAME} />;
}
