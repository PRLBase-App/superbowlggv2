import Link from "next/link";
import { getLeaderboard } from "@/lib/data";
import { Badge, EmptyState, SectionTitle } from "@/components/ui";

export type LeaderboardPeriod = "weekly" | "monthly" | "season" | "allTime";

const periods: { key: LeaderboardPeriod; slug: string; label: string; minimum: number }[] = [
  { key: "weekly", slug: "weekly", label: "Weekly", minimum: 5 },
  { key: "monthly", slug: "monthly", label: "Monthly", minimum: 15 },
  { key: "season", slug: "season", label: "Season", minimum: 30 },
  { key: "allTime", slug: "all-time", label: "All Time", minimum: 15 },
];

export async function LeaderboardBoard({ period }: { period: LeaderboardPeriod }) {
  const rows = await getLeaderboard(period);
  const selected = periods.find((item) => item.key === period) ?? periods[3];

  return (
    <div className="space-y-6">
      <SectionTitle sub={`${selected.label} rankings from genuinely settled predictions`}>
        <span className="text-brand-text">NFL Prediction Leaderboard</span>
      </SectionTitle>

      <nav className="flex flex-wrap gap-2" aria-label="Leaderboard period">
        {periods.map((item) => (
          <Link key={item.key} href={`/leaderboard/${item.slug}`} className={`tab ${period === item.key ? "tab-active" : ""}`}>
            {item.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState title="No qualifying predictors yet" body={`At least ${selected.minimum} settled predictions are required for this period.`} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="table-head px-4 py-3">#</th>
                <th className="table-head px-4 py-3">Predictor</th>
                <th className="table-head px-4 py-3 text-right">Picks</th>
                <th className="table-head px-4 py-3 text-right">W-L-P</th>
                <th className="table-head px-4 py-3 text-right">Accuracy</th>
                <th className="table-head px-4 py-3 text-right">ROI</th>
                <th className="table-head px-4 py-3 text-right">Units</th>
                <th className="table-head px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {rows.map((row, index) => (
                <tr key={row.user.id} className="transition-colors hover:bg-brand-surface">
                  <td className={`px-4 py-3 font-display text-base font-bold ${index === 0 ? "text-brand-gold" : index < 3 ? "text-brand-primary" : "text-brand-muted"}`}>{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/users/${row.user.profile?.username ?? ""}`} className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-secondary/30 text-xs font-bold text-brand-secondary">
                        {(row.user.profile?.displayName ?? row.user.name ?? "?")[0]?.toUpperCase()}
                      </span>
                      <span>
                        <span className="block font-medium text-brand-text">{row.user.profile?.displayName ?? row.user.name ?? row.user.profile?.username}</span>
                        <span className="block text-xs text-brand-muted">@{row.user.profile?.username ?? "predictor"}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="scoreboard-num px-4 py-3 text-right">{row.settled}</td>
                  <td className="scoreboard-num px-4 py-3 text-right text-brand-muted">{row.wins}-{row.losses}-{row.pushes}</td>
                  <td className="scoreboard-num px-4 py-3 text-right"><Badge tone={row.accuracy >= 0.55 ? "green" : row.accuracy >= 0.45 ? "slate" : "red"}>{Math.round(row.accuracy * 100)}%</Badge></td>
                  <td className={`scoreboard-num px-4 py-3 text-right ${row.roi >= 0 ? "text-brand-success" : "text-brand-danger"}`}>{row.roi >= 0 ? "+" : ""}{(row.roi * 100).toFixed(1)}%</td>
                  <td className={`scoreboard-num px-4 py-3 text-right ${row.units >= 0 ? "text-brand-success" : "text-brand-danger"}`}>{row.units >= 0 ? "+" : ""}{row.units}</td>
                  <td className="scoreboard-num px-4 py-3 text-right font-bold text-brand-text">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-brand-muted">Pushes do not count as wins or losses. ROI and units use each prediction&apos;s immutable odds snapshot.</p>
    </div>
  );
}
