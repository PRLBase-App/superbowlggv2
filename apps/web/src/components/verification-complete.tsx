"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function VerificationComplete({ referralCode, verificationError, returnTo }: { referralCode?: string; verificationError?: string; returnTo: string }) {
  const router = useRouter();
  const [state, setState] = useState<"loading" | "ready" | "error">(verificationError ? "error" : "loading");
  const [message, setMessage] = useState(verificationError ?? "Finishing your account setup…");

  useEffect(() => {
    if (verificationError) return;
    let active = true;
    void fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(referralCode ? { ref: referralCode } : {}),
    }).then(async (response) => {
      if (!active) return;
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        setState("error");
        setMessage(body?.error ?? "Email verified, but account setup could not be completed.");
        return;
      }
      setState("ready");
      setMessage("Email verified. Returning to your pick…");
      router.refresh();
      router.replace(returnTo);
    }).catch(() => {
      if (!active) return;
      setState("error");
      setMessage("Email verified, but account setup could not be completed.");
    });
    return () => { active = false; };
  }, [referralCode, returnTo, router, verificationError]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-text">Email verification</h1>
        <p className={`mt-3 text-sm ${state === "error" ? "text-brand-danger" : state === "ready" ? "text-brand-success" : "text-brand-muted"}`}>{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          {state === "ready" ? <Link href={returnTo} className="btn-primary">Continue</Link> : null}
          {state === "error" ? <Link href={`/auth/sign-in?next=${encodeURIComponent(returnTo)}`} className="btn-secondary">Log in</Link> : null}
        </div>
      </div>
    </div>
  );
}
