import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge, TeamBadge } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table-actions";
import { gameStatusLabel } from "@sbgg/core";

export const metadata: Metadata = { title: "Admin · Games" };

export const revalidate = 15;

export default async function AdminGamesPage() {
  const [games, syncLogs] = await Promise.all([
    prisma.game.findMany({ include: { homeTeam: true, awayTeam: true }, orderBy: { scheduledAt: "desc" }, take: 80 }),
    prisma.integrationSyncLog.findMany({ orderBy: { startedAt: "desc" }, take: 40 }),
  ]);
  const latestSync = [...new Map(syncLogs.map((log) => [log.jobType, log])).values()];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Games</h1>
      <section className="card space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-brand-text">Provider synchronization</h2>
          <p className="text-sm text-brand-muted">Queue an idempotent worker job. The Railway worker claims requests and records the real provider result.</p>
        </div>
        <AdminTableActions actions={[
          { label: "Sync schedule", action: "sync.request", payload: { jobType: "SYNC_SCHEDULE" } },
          { label: "Sync teams", action: "sync.request", payload: { jobType: "SYNC_TEAMS" } },
          { label: "Sync players", action: "sync.request", payload: { jobType: "SYNC_PLAYERS" } },
          { label: "Sync standings", action: "sync.request", payload: { jobType: "SYNC_STANDINGS" } },
          { label: "Sync injuries", action: "sync.request", payload: { jobType: "SYNC_INJURIES" } },
          { label: "Sync live games", action: "sync.request", payload: { jobType: "SYNC_LIVE_GAMES" } },
          { label: "Sync odds", action: "sync.request", payload: { jobType: "SYNC_ODDS" } },
          { label: "Run settlement", action: "sync.request", payload: { jobType: "SETTLE_PREDICTIONS" } },
        ]} />
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {latestSync.map((log) => (
            <div key={log.id} className="rounded-lg border border-brand-border bg-brand-surface2 p-3 text-xs">
              <div className="flex items-center justify-between gap-2"><span className="font-medium text-brand-text">{log.jobType.replaceAll("_", " ")}</span><Badge tone={log.status === "SUCCESS" ? "green" : log.status === "FAILED" ? "red" : "gold"}>{log.status}</Badge></div>
              <p className="mt-1 text-brand-muted">{log.itemsProcessed} items · {log.startedAt.toLocaleString()}</p>
              {log.error ? <p className="mt-1 line-clamp-2 text-brand-danger">{log.error}</p> : null}
            </div>
          ))}
        </div>
      </section>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="table-head px-4 py-2.5">Matchup</th>
              <th className="table-head px-4 py-2.5">Week</th>
              <th className="table-head px-4 py-2.5">Status</th>
              <th className="table-head px-4 py-2.5 text-right">Score</th>
              <th className="table-head px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {games.map((g) => (
              <tr key={g.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-2">
                    <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} logoUrl={g.awayTeam.logoUrl} size="sm" />
                    <span className="text-brand-muted">@</span>
                    <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} logoUrl={g.homeTeam.logoUrl} size="sm" />
                  </span>
                </td>
                <td className="px-4 py-2.5 text-brand-muted">W{g.week}</td>
                <td className="px-4 py-2.5"><Badge tone={g.status === "LIVE" ? "red" : g.status === "FINAL" ? "slate" : "blue"}>{gameStatusLabel(g.status)}</Badge></td>
                <td className="scoreboard-num px-4 py-2.5 text-right">{g.awayScore}–{g.homeScore}</td>
                <td className="px-4 py-2.5">
                  <AdminTableActions
                    actions={[
                      ...(g.status !== "FINAL" ? [{ label: "Mark final", action: "game.setStatus", payload: { gameId: g.id, status: "FINAL" } }] : [{ label: "Reopen", action: "game.setStatus", payload: { gameId: g.id, status: "SCHEDULED" } }]),
                      { label: "Cancel", action: "game.setStatus", payload: { gameId: g.id, status: "CANCELLED" } },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
