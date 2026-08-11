import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@sbgg/db";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Following", robots: { index: false } };

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await prisma.profile.findUnique({ where: { username }, include: { user: true } });
  if (!profile) notFound();
  const following = await prisma.userFollow.findMany({ where: { followerId: profile.userId }, include: { following: { include: { profile: true } } }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">@{username} follows</h1>
      {following.length === 0 ? (
        <EmptyState title="Not following anyone yet" />
      ) : (
        <div className="space-y-2">
          {following.map((f) => (
            <Link key={f.id} href={`/users/${f.following.profile?.username ?? "me"}`} className="card card-hover flex items-center gap-3 !p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary/30 text-sm font-bold text-brand-secondary">
                {(f.following.profile?.displayName ?? f.following.name ?? "?")[0]?.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-text">{f.following.profile?.displayName ?? f.following.name}</p>
                <p className="text-xs text-brand-muted">@{f.following.profile?.username ?? "predictor"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
