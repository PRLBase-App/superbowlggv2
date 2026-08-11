"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient();

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      if (!token) {
        setError("Missing reset token in the URL.");
        return;
      }
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) setError(res.error.message ?? "Reset failed");
      else {
        setDone(true);
        setTimeout(() => router.push("/auth/sign-in"), 1200);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold text-brand-text">Choose a new password</h1>
        {done ? (
          <p className="mt-4 text-sm text-brand-success">Password updated — redirecting to log in…</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="password">New password</label>
              <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} autoComplete="new-password" />
            </div>
            {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Updating…" : "Update password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
