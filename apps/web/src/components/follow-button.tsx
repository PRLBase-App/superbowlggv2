"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FollowButton({ username, initialFollowing, isSelf }: { username: string; initialFollowing: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  if (isSelf) {
    return (
      <button
        className="btn-secondary"
        onClick={async () => {
          const res = await fetch("/api/settings/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
          if (res.ok) router.refresh();
        }}
      >
        Edit profile
      </button>
    );
  }

  return (
    <button
      className={following ? "btn-secondary" : "btn-primary"}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, follow: !following }),
        });
        if (res.ok) {
          setFollowing(!following);
          router.refresh();
        }
        setBusy(false);
      }}
    >
      {following ? "Following" : "+ Follow"}
    </button>
  );
}
