"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ username, initialFollowing, isSelf }: { username: string; initialFollowing: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isSelf) {
    return <Link href="/settings" className="btn-secondary">Edit profile</Link>;
  }

  return (
    <div><button
        className={following ? "btn-secondary" : "btn-primary"}
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true); setError(null);
          try {
            const res = await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, follow: !following }) });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error ?? "Follow action failed");
            setFollowing(Boolean(body.following));
            router.refresh();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "The network did not respond.");
          } finally { setBusy(false); }
        }}
      >{busy ? "Saving…" : following ? "Following" : "+ Follow"}</button>{error ? <p className="mt-2 text-xs text-brand-danger" role="alert">{error}</p> : null}</div>
  );
}
