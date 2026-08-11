import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getWallet } from "@/lib/data";
import { prisma } from "@sbgg/db";
import { Card, SectionTitle, EmptyState } from "@/components/ui";
import { CollectCoinsButton } from "@/components/collect-coins-button";
import { levelForXp, streakMilestoneReward } from "@sbgg/gamification";

export const metadata: Metadata = { title: "Wallet & Coins", description: "Your Superbowl.gg virtual coin wallet, daily rewards and transaction history." };

export const revalidate = 30;

export default async function WalletPage() {
  const session = await requireSession();
  const [wallet, streak, xp, achievements, gamification] = await Promise.all([
    getWallet(session.user.id),
    prisma.dailyStreak.findUnique({ where: { userId: session.user.id } }),
    prisma.userXP.findUnique({ where: { userId: session.user.id } }),
    prisma.userAchievement.count({ where: { userId: session.user.id } }),
    prisma.gamificationEvent.aggregate({ where: { userId: session.user.id }, _sum: { xpAwarded: true, coinsAwarded: true } }),
  ]);

  const collectedToday = streak?.lastActivityDate ? new Date(streak.lastActivityDate).toDateString() === new Date().toDateString() : false;
  const level = levelForXp(xp?.totalXp ?? 0);
  const nextMilestone = streak ? streakMilestoneReward(streak.currentStreak + 1) : null;

  return (
    <div className="space-y-8">
      <SectionTitle sub="Virtual currency only — never cash-out-able">
        <span className="text-brand-text">My Coins</span>
      </SectionTitle>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="sm:col-span-2">
          <p className="text-xs uppercase tracking-wide text-brand-muted">Balance</p>
          <p className="scoreboard-num mt-1 text-4xl font-bold text-brand-gold">◎ {wallet?.balance.toLocaleString() ?? "0"}</p>
          <p className="mt-1 text-xs text-brand-muted">
            Earned ◎{(gamification._sum.coinsAwarded ?? 0).toLocaleString()} all-time · {xp?.totalXp ?? 0} XP total
          </p>
          <div className="mt-4 max-w-xs">
            <CollectCoinsButton canCollect={!collectedToday} />
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Daily streak</p>
          <p className="scoreboard-num mt-1 text-4xl font-bold text-brand-text">{streak?.currentStreak ?? 0} <span className="text-lg text-brand-muted">days</span></p>
          <p className="mt-1 text-xs text-brand-muted">Longest: {streak?.longestStreak ?? 0} days</p>
          {nextMilestone ? <p className="mt-2 text-xs text-brand-muted">Next milestone ({streak?.currentStreak ?? 0 + 1} days): +{nextMilestone} ◎</p> : null}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface2 p-2.5 text-xs">
            <span className="text-brand-muted">Level</span>
            <span className="font-semibold text-brand-primary">{level.title} · Lv {level.level}</span>
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle sub="Every balance change is an immutable ledger entry">Transaction history</SectionTitle>
        {wallet?.transactions.length ? (
          <div className="overflow-hidden rounded-xl border border-brand-border">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="table-head px-4 py-2.5">Type</th>
                  <th className="table-head px-4 py-2.5">Description</th>
                  <th className="table-head px-4 py-2.5 text-right">Amount</th>
                  <th className="table-head px-4 py-2.5 text-right">Balance</th>
                  <th className="table-head px-4 py-2.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {wallet.transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2.5">
                      <span className="badge bg-brand-surface2 text-brand-muted ring-1 ring-brand-border">{t.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-brand-muted">{t.description}</td>
                    <td className={`scoreboard-num px-4 py-2.5 text-right ${t.amount >= 0 ? "text-brand-success" : "text-brand-danger"}`}>{t.amount >= 0 ? "+" : ""}{t.amount}</td>
                    <td className="scoreboard-num px-4 py-2.5 text-right text-brand-text">{t.balanceAfter}</td>
                    <td className="px-4 py-2.5 text-right text-brand-muted">{t.createdAt.toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No transactions yet" body="Publish predictions and collect daily coins to get started." />
        )}
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/achievements" className="text-brand-primary hover:underline">Achievements ({achievements})</Link>
        <Link href="/referrals" className="text-brand-primary hover:underline">Referral program</Link>
        <Link href="/marketplace" className="text-brand-primary hover:underline">Spend coins in the marketplace →</Link>
      </div>
    </div>
  );
}
