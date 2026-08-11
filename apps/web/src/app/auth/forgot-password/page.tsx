"use client";

import { useState } from "react";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await authClient.requestPasswordReset({ email, redirectTo: "/auth/reset-password" });
      if (res.error) setError(res.error.message ?? "Request failed");
      else setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold text-brand-text">Reset your password</h1>
        <p className="mt-1 text-sm text-brand-muted">Enter your email and we&apos;ll send you a reset link.</p>
        {sent ? (
          <div className="mt-6 rounded-lg border border-brand-success/40 bg-brand-success/10 px-4 py-3 text-sm text-brand-success">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Sending…" : "Send reset link"}</button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-brand-muted">
          <Link href="/auth/sign-in" className="text-brand-primary hover:underline">Back to log in</Link>
        </p>
      </div>
    </div>
  );
}
