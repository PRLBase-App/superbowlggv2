import type { Metadata } from "next";

export const metadata: Metadata = { title: "How it works", description: "How Superbowl.gg works: predict, earn, redeem." };

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-brand-text">How Superbowl.gg works</h1>
      <div className="space-y-4">
        {[
          ["1. Pick your games", "Browse the NFL slate on the Games page. Every game shows moneylines, spreads, totals and player props with odds."],
          ["2. Publish your prediction", "Choose a market and an outcome, set your confidence, add analysis and publish. Your pick locks at kickoff."],
          ["3. Build your record", "Every pick settles automatically when the game ends — WIN, LOSS, PUSH or VOID. Your record is permanent and public."],
          ["4. Earn XP & coins", "Publishing picks, correct predictions, daily streaks and achievements all earn XP and virtual coins."],
          ["5. Redeem in the Marketplace", "Spend coins on partner offers, promo codes and merchandise. Coins are virtual — they have no cash value."],
          ["6. Follow the best", "Follow top predictors, get notified when they publish, and compare records on the leaderboard."],
        ].map(([title, body]) => (
          <div key={title} className="card">
            <h2 className="font-semibold text-brand-text">{title}</h2>
            <p className="mt-1 text-sm text-brand-muted">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
