import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Log in", description: "Log in to Superbowl.gg" };

export default function SignInPage() {
  return <AuthForm mode="sign-in" />;
}
