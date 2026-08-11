import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · Audit Log" };

export const revalidate = 15;

export default async function AdminAuditLogPage() {
  const logs = await prisma.adminAuditLog.findMany({ include: { admin: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Audit log</h1>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Admin</th><th className="table-head px-4 py-2.5">Action</th><th className="table-head px-4 py-2.5">Details</th><th className="table-head px-4 py-2.5 text-right">When</th></tr></thead>
          <tbody className="divide-y divide-brand-border">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5 text-brand-text">{l.admin.email}</td>
                <td className="px-4 py-2.5"><Badge tone="blue">{l.action}</Badge></td>
                <td className="px-4 py-2.5 font-mono text-xs text-brand-muted">{JSON.stringify(l.details)}</td>
                <td className="px-4 py-2.5 text-right text-brand-muted">{l.createdAt.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
