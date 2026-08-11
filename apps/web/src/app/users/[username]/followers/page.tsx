import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@sbgg/db";
import { EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Followers", robots: { index: false } };

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await prisma.profile.findUnique({ where: { username }, include: { user: true } });
  if (!profile) notFound();
  const followers = await prisma.userFollow.findMany({ where: { followingId: profile.userId }, include: { follower: { include: { profile: true } } }, orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">@{username}&apos;s followers</h1>
      {followers.length === 0 ? (
        <EmptyState title="No followers yet" />
      ) : (
        <div className="space-y-2">
          {followers.map((f) => (
            <Link key={f.id} href={`/users/${f.follower.profile?.username ?? "me"}`} className="card card-hover flex items-center gap-3 !p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary/30 text-sm font-bold text-brand-secondary">
                {(f.follower.profile?.displayName ?? f.follower.name ?? "?")[0]?.toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-text">{f.follower.profile?.displayName ?? f.follower.name}</p>
                <p className="text-xs text-brand-muted">@{f.follower.profile?.username ?? "predictor"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
