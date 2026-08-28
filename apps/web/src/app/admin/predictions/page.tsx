import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table-actions";

export const metadata: Metadata = { title: "Admin · Predictions" };

export const revalidate = 15;

export default async function AdminPredictionsPage() {
  const preds = await prisma.prediction.findMany({
    include: { user: { include: { profile: true } }, game: { include: { homeTeam: true, awayTeam: true } } },
    orderBy: { publishedAt: "desc" },
    take: 80,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Predictions</h1>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="table-head px-4 py-2.5">User</th>
              <th className="table-head px-4 py-2.5">Pick</th>
              <th className="table-head px-4 py-2.5">Status</th>
              <th className="table-head px-4 py-2.5 text-right">Odds</th>
              <th className="table-head px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {preds.map((p) => (
              <tr key={p.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5 font-medium text-brand-text">@{p.user.profile?.username ?? p.user.email}</td>
                <td className="px-4 py-2.5 text-brand-muted">
                  {p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation} · {p.marketType}: {p.selection}
                </td>
                <td className="px-4 py-2.5">
                  <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : p.status === "VOIDED" ? "slate" : "blue"}>
                    {p.status}{p.result ? ` · ${p.result}` : ""}
                  </Badge>
                </td>
                <td className="scoreboard-num px-4 py-2.5 text-right">{p.oddsAtCreation ?? "Community"}</td>
                <td className="px-4 py-2.5">
                  {p.status !== "VOIDED" ? (
                    <AdminTableActions actions={[{ label: "Void", action: "prediction.void", payload: { predictionId: p.id } }]} />
                  ) : (
                    <span className="text-xs text-brand-muted">Voided</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
