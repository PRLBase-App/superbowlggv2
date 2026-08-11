import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getReferral } from "@/lib/data";
import { Card, SectionTitle, EmptyState } from "@/components/ui";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = { title: "Referral Program", description: "Invite friends to Superbowl.gg and earn coins." };

export const revalidate = 15;

export default async function ReferralsPage() {
  const session = await requireSession();
  const referral = await getReferral(session.user.id);
  const events = referral?.events ?? [];
  const activated = events.filter((e) => e.type === "ACTIVATED").length;
  const link = referral ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/r/${referral.code}` : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle sub="Share your code, earn coins for every friend who activates">
        <span className="text-brand-text">Invite friends</span>
      </SectionTitle>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-brand-border bg-brand-surface2 p-3 text-center">
            <p className="scoreboard-num text-2xl font-bold text-brand-gold">+500 ◎</p>
            <p className="text-xs text-brand-muted">You receive</p>
          </div>
          <div className="rounded-lg border border-brand-border bg-brand-surface2 p-3 text-center">
            <p className="scoreboard-num text-2xl font-bold text-brand-gold">+500 ◎</p>
            <p className="text-xs text-brand-muted">Friend receives</p>
          </div>
          <div className="rounded-lg border border-brand-border bg-brand-surface2 p-3 text-center">
            <p className="scoreboard-num text-2xl font-bold text-brand-text">{activated}</p>
            <p className="text-xs text-brand-muted">Activated friends</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-brand-muted">
          Activation: your friend registers and makes 5 successful predictions with odds ≥ 1.6. Both sides earn the bonus.
        </p>
      </Card>

      <Card>
        <p className="label">Your invitation code</p>
        <p className="scoreboard-num text-2xl font-bold tracking-wider text-brand-primary">{referral?.code ?? "—"}</p>
        {link ? (
          <>
            <p className="label mt-4">Your invitation link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-brand-border bg-brand-bg px-3 py-2 text-xs text-brand-muted">{link}</code>
              <CopyButton value={link} />
            </div>
          </>
        ) : null}
      </Card>

      <section>
        <SectionTitle sub="Everyone who joined through your link">Invitation list</SectionTitle>
        {events.length === 0 ? (
          <EmptyState title="No invites yet" body="Share your code — friends appear here once they sign up." />
        ) : (
          <div className="space-y-2">
            {events.map((e) => (
              <Card key={e.id} className="flex items-center justify-between !p-3 text-sm">
                <span className="text-brand-text">{e.type === "CLICK" ? "Link click" : e.type === "SIGNUP" ? "Signup" : "Activated"}</span>
                <span className="text-xs text-brand-muted">{e.createdAt.toLocaleDateString()}{e.rewardPaid ? " · reward paid" : ""}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
