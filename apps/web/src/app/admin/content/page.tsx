import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · Content" };

export const revalidate = 15;

export default async function AdminContentPage() {
  const pages = await prisma.contentPage.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Content pages</h1>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Slug</th><th className="table-head px-4 py-2.5">Title</th><th className="table-head px-4 py-2.5">Status</th><th className="table-head px-4 py-2.5 text-right">Updated</th></tr></thead>
          <tbody className="divide-y divide-brand-border">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5 font-mono text-xs text-brand-text">{p.slug}</td>
                <td className="px-4 py-2.5 text-brand-muted">{p.title}</td>
                <td className="px-4 py-2.5"><Badge tone={p.published ? "green" : "slate"}>{p.published ? "Published" : "Draft"}</Badge></td>
                <td className="px-4 py-2.5 text-right text-brand-muted">{p.updatedAt.toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
