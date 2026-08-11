"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export function AuthForm({ mode, initialRef }: { mode: "sign-in" | "sign-up"; initialRef?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: username || email.split("@")[0]!,
          callbackURL: `/auth/verify-email${initialRef ? `?ref=${encodeURIComponent(initialRef)}` : ""}`,
        });
        if (res.error) {
          setError(res.error.message ?? "Sign up failed");
        } else {
          setInfo("Account created. Check your inbox and verify your email to continue.");
        }
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) {
          setError(res.error.message ?? "Invalid credentials");
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold text-brand-text">
          {mode === "sign-in" ? "Log in to Superbowl" : "Join Superbowl — Free"}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          {mode === "sign-in" ? "Welcome back. Your record is waiting." : "Create an account and get 1000 free coins."}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "sign-up" ? (
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" className="input" placeholder="e.g. joelk" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} required minLength={3} maxLength={24} autoComplete="username" />
            </div>
          ) : null}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" placeholder={mode === "sign-up" ? "12+ characters" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
          </div>

          {error ? <p className="rounded-lg border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger" role="alert">{error}</p> : null}
          {info ? <p className="rounded-lg border border-brand-success/40 bg-brand-success/10 px-3 py-2 text-sm text-brand-success">{info}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Please wait…" : mode === "sign-in" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-brand-muted">
          {mode === "sign-in" ? (
            <>
              <Link href="/auth/forgot-password" className="text-brand-primary hover:underline">Forgot password?</Link>
              <span className="mx-2">·</span>
              <Link href="/auth/sign-up" className="text-brand-primary hover:underline">Create account</Link>
            </>
          ) : (
            <Link href="/auth/sign-in" className="text-brand-primary hover:underline">Already have an account? Log in</Link>
          )}
        </div>
      </div>
    </div>
  );
}
