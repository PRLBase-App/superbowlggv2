"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedeemButton({ slug, coinPrice, enoughCoins, loggedIn }: { slug: string; coinPrice: number; enoughCoins: boolean; loggedIn: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<{ ok?: boolean; error?: string; promoCode?: string; destinationUrl?: string }>({});
  const [busy, setBusy] = useState(false);

  if (!loggedIn) {
    return <a href="/auth/sign-up" className="btn-primary w-full">Join free to redeem</a>;
  }

  return (
    <div className="space-y-2">
      <button
        className="btn-primary w-full"
        disabled={!enoughCoins || busy}
        onClick={async () => {
          setBusy(true);
          const res = await fetch("/api/marketplace/redeem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug }),
          });
          const body = await res.json().catch(() => ({}));
          setState(body);
          setBusy(false);
          if (body.ok) router.refresh();
        }}
      >
        {busy ? "Redeeming…" : `Redeem for ◎ ${coinPrice.toLocaleString()}`}
      </button>
      {!enoughCoins ? <p className="text-xs text-brand-danger">Not enough coins — earn more with predictions and daily streaks.</p> : null}
      {state.ok ? (
        <div className="rounded-lg border border-brand-success/40 bg-brand-success/10 p-3 text-sm text-brand-success">
          <p>Redeemed!</p>
          {state.promoCode ? <p>Your code: <strong className="font-mono">{state.promoCode}</strong></p> : null}
          {state.destinationUrl ? <a className="mt-2 inline-block font-semibold underline" href={state.destinationUrl} rel="noopener noreferrer" target="_blank">Open reward</a> : null}
        </div>
      ) : null}
      {state.error ? <p className="text-sm text-brand-danger">{state.error}</p> : null}
    </div>
  );
}
