import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table-actions";

export const metadata: Metadata = { title: "Admin · Users" };

export const revalidate = 15;

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const pageSize = 25;

  const users = await prisma.user.findMany({
    where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { profile: { username: { contains: q, mode: "insensitive" } } }] } : {},
    include: { profile: true, _count: { select: { predictions: true } }, wallet: true },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  const total = await prisma.user.count({ where: q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { name: { contains: q, mode: "insensitive" } }, { profile: { username: { contains: q, mode: "insensitive" } } }] } : {} });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Users</h1>
      <form className="flex gap-2" action={`/admin/users`}>
        <input name="q" defaultValue={q} placeholder="Search email, name, username…" className="input max-w-sm" />
        <button className="btn-secondary" type="submit">Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="table-head px-4 py-2.5">User</th>
              <th className="table-head px-4 py-2.5">Role</th>
              <th className="table-head px-4 py-2.5">Status</th>
              <th className="table-head px-4 py-2.5 text-right">Predictions</th>
              <th className="table-head px-4 py-2.5 text-right">Coins</th>
              <th className="table-head px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-brand-text">{u.name ?? "—"} <span className="text-brand-muted">@{u.profile?.username ?? "—"}</span></p>
                  <p className="text-xs text-brand-muted">{u.email}</p>
                </td>
                <td className="px-4 py-2.5"><Badge tone={u.role === "SUPER_ADMIN" ? "gold" : u.role === "ADMIN" ? "blue" : "slate"}>{u.role}</Badge></td>
                <td className="px-4 py-2.5"><Badge tone={u.status === "ACTIVE" ? "green" : "red"}>{u.status}</Badge></td>
                <td className="scoreboard-num px-4 py-2.5 text-right">{u._count.predictions}</td>
                <td className="scoreboard-num px-4 py-2.5 text-right text-brand-gold">{u.wallet?.balance ?? 0}</td>
                <td className="px-4 py-2.5">
                  <AdminTableActions
                    actions={[
                      ...(u.status === "ACTIVE" ? [{ label: "Suspend", action: "user.setStatus", payload: { userId: u.id, status: "SUSPENDED" } }] : [{ label: "Unsuspend", action: "user.setStatus", payload: { userId: u.id, status: "ACTIVE" } }]),
                      { label: "Make admin", action: "user.setRole", payload: { userId: u.id, role: "ADMIN" } },
                      { label: "Make user", action: "user.setRole", payload: { userId: u.id, role: "USER" } },
                      { label: "+100 coins", action: "user.adjustWallet", payload: { userId: u.id, amount: 100, reason: "Manual adjustment" } },
                      { label: "−100 coins", action: "user.adjustWallet", payload: { userId: u.id, amount: -100, reason: "Manual adjustment" } },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 text-sm text-brand-muted">
        <span>{total} users · page {page}</span>
        {page > 1 ? <a className="text-brand-primary hover:underline" href={`/admin/users?q=${q}&page=${page - 1}`}>← Prev</a> : null}
        {page * pageSize < total ? <a className="text-brand-primary hover:underline" href={`/admin/users?q=${q}&page=${page + 1}`}>Next →</a> : null}
      </div>
    </div>
  );
}
