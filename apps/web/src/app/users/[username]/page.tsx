import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { prisma } from "@sbgg/db";
import { Badge, SectionTitle, EmptyState } from "@/components/ui";
import { FollowButton } from "@/components/follow-button";
import { levelForXp, predictionPoints } from "@sbgg/gamification";
import { timeAgo } from "@sbgg/core";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "User not found" };
  return {
    title: `@${profile.username} — Predictor Profile, Record & Picks`,
    description: `${profile.displayName ?? profile.username}'s NFL prediction record, statistics and public picks on Superbowl.gg.`,
    alternates: { canonical: `/users/${profile.username}` },
  };
}

export const revalidate = 30;

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [profile, me] = await Promise.all([getProfileByUsername(username), getSessionUser()]);
  if (!profile) notFound();

  const u = profile.user;
  const settled = u.predictions.filter((p) => p.status === "SETTLED" && (p.result === "WIN" || p.result === "LOSS"));
  const wins = settled.filter((p) => p.result === "WIN").length;
  const losses = settled.length - wins;
  const accuracy = settled.length ? wins / settled.length : 0;
  const points = settled.reduce((acc, p) => acc + predictionPoints({ result: p.result!, odds: p.oddsAtCreation }), 0);
  const units = settled.reduce((acc, p) => acc + (p.oddsAtCreation == null ? 0 : p.result === "WIN" ? p.oddsAtCreation - 1 : -1), 0);
  const level = u.xp ? levelForXp(u.xp.totalXp) : levelForXp(0);

  const isSelf = me?.id === u.id;
  const existingFollow = me ? await prisma.userFollow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: u.id } } }) : null;

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.displayName ?? username,
    alternateName: `@${profile.username}`,
    description: `NFL predictor on Superbowl.gg with ${settled.length} settled predictions.`,
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />

      <section className="card yardlines relative overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-secondary/30 text-2xl font-bold text-brand-secondary">
              {(profile.displayName ?? username)[0]?.toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold text-brand-text">{profile.displayName ?? username}</h1>
              <p className="text-sm text-brand-muted">@{profile.username} · joined {u.createdAt.toLocaleDateString()}</p>
              {profile.bio ? <p className="mt-1 max-w-md text-sm text-brand-muted">{profile.bio}</p> : null}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                <Badge tone="blue">{level.title} · Lv {level.level}</Badge>
                <span>{u._count.followers} followers</span>
                <span>· {u._count.following} following</span>
                <span>· {u._count.predictions} predictions</span>
              </div>
            </div>
          </div>
          {me ? <FollowButton username={username} initialFollowing={!!existingFollow} isSelf={isSelf} /> : <Link href={`/auth/sign-in?next=${encodeURIComponent(`/users/${encodeURIComponent(username)}`)}`} className="btn-secondary">Log in to follow</Link>}
        </div>

        {/* stat strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-brand-border pt-4 sm:grid-cols-5">
          {[
            { label: "Win Rate", value: settled.length ? `${Math.round(accuracy * 100)}%` : "—" },
            { label: "Record", value: settled.length ? `${wins}–${losses}` : "—" },
            { label: "Units", value: units ? `${units >= 0 ? "+" : ""}${units.toFixed(1)}` : "—", tone: units >= 0 ? "text-brand-success" : "text-brand-danger" },
            { label: "Points", value: String(points) },
            { label: "XP", value: u.xp ? String(u.xp.totalXp) : "0" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-brand-border bg-brand-surface2 p-3 text-center">
              <p className={`scoreboard-num text-xl font-bold ${s.tone ?? "text-brand-text"}`}>{s.value}</p>
              <p className="text-[11px] uppercase tracking-wide text-brand-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle sub="Public prediction history — permanent">Predictions</SectionTitle>
        {u.predictions.length === 0 ? (
          <EmptyState title="No predictions published yet" />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {u.predictions.map((p) => (
              <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-brand-muted">{p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation}</span>
                  <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : "blue"}>
                    {p.status === "SETTLED" ? p.result : p.status}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-brand-text">
                  {p.marketType === "MONEYLINE" ? "ML" : p.marketType === "SPREAD" ? "SPR" : p.marketType === "TOTAL" ? "TOT" : "PROP"}: {p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection}{p.line != null ? ` (${p.line})` : ""}
                </p>
                <p className="mt-1 text-xs text-brand-muted">{p.oddsAtCreation == null ? "Community line · no sportsbook odds" : `Odds ${p.oddsAtCreation}`} · {timeAgo(p.publishedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle sub="Unlocked achievements">Achievements</SectionTitle>
        {u.achievements.length === 0 ? (
          <EmptyState title="No achievements yet" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {u.achievements.map((a) => (
              <span key={a.id} className="badge bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">
                🏅 {a.achievement.title}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="flex gap-4 text-sm">
        <Link href={`/users/${username}/predictions`} className="text-brand-primary hover:underline">All predictions</Link>
        <Link href={`/users/${username}/followers`} className="text-brand-primary hover:underline">Followers</Link>
        <Link href={`/users/${username}/following`} className="text-brand-primary hover:underline">Following</Link>
      </div>
    </div>
  );
}
