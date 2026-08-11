"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export function SocialAuthComplete({ referralCode }: { referralCode?: string }) {
  const [error, setError] = useState<string | null>(null);

  const complete = useCallback(async () => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(referralCode ? { ref: referralCode } : {}),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        setError(result?.error ?? "Account setup could not be completed.");
        return;
      }
      window.location.replace("/");
    } catch {
      setError("Account setup is temporarily unavailable.");
    }
  }, [referralCode]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void complete(); }, 0);
    return () => window.clearTimeout(timer);
  }, [complete]);

  const retry = () => {
    setError(null);
    void complete();
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white p-0.5 shadow-[0_8px_24px_rgba(19,21,32,0.12)]">
          <Image src="/logo.svg" alt="" width={56} height={56} priority className="h-full w-full object-contain" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-brand-text">Finishing your account</h1>
        {error ? (
          <><p className="mt-3 text-sm text-brand-danger">{error}</p><div className="mt-5 flex justify-center gap-2"><button type="button" onClick={retry} className="btn-primary">Try again</button><Link href="/auth/sign-in" className="btn-secondary">Back to sign in</Link></div></>
        ) : <p className="mt-3 text-sm text-brand-muted">Creating your predictor profile and welcome balance…</p>}
      </div>
    </div>
  );
}
