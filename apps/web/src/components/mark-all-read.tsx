"use client";

import { useRouter } from "next/navigation";

export function MarkAllReadButton() {
  const router = useRouter();
  return (
    <button
      className="btn-ghost"
      onClick={async () => {
        await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
        router.refresh();
      }}
    >
      Mark all as read
    </button>
  );
}
