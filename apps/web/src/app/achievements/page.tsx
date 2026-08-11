import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getUserAchievements } from "@/lib/data";
import { Badge, SectionTitle, EmptyState } from "@/components/ui";

export const metadata: Metadata = { title: "Achievements", description: "Your Superbowl.gg achievements and progress." };

export const revalidate = 15;

export default async function AchievementsPage() {
  const session = await requireSession();
  const { unlocked, all } = await getUserAchievements(session.user.id);
  const unlockedKeys = new Set(unlocked.map((u) => u.achievementId));

  return (
    <div className="space-y-6">
      <SectionTitle sub={`${unlocked.length} / ${all.length} unlocked — keep predicting`}>
        <span className="text-brand-text">Achievements</span>
      </SectionTitle>

      {all.length === 0 ? (
        <EmptyState title="No achievements configured" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((a) => {
            const isUnlocked = unlockedKeys.has(a.id);
            return (
              <div key={a.id} className={`card ${isUnlocked ? "border-brand-gold/40" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden>{isUnlocked ? "🏅" : "🔒"}</span>
                  <Badge tone={isUnlocked ? "gold" : "slate"}>{isUnlocked ? "Unlocked" : "Locked"}</Badge>
                </div>
                <p className="mt-2 font-semibold text-brand-text">{a.title}</p>
                <p className="mt-1 text-xs text-brand-muted">{a.description}</p>
                <p className="mt-2 text-xs text-brand-muted">
                  Reward: <span className="text-brand-primary">+{a.xpReward} XP</span> · <span className="text-brand-gold">+{a.coinReward} ◎</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
