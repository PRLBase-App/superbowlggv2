import Link from "next/link";

/** Shared layout for SEO content hubs. */
export function SeoHubShell({ title, description, children, links }: { title: string; description: string; children: React.ReactNode; links?: { href: string; label: string }[] }) {
  return (
    <div className="space-y-8">
      <header className="card yardlines relative overflow-hidden">
        <h1 className="font-display text-3xl font-bold text-brand-text">{title}</h1>
        <p className="mt-2 max-w-2xl text-brand-muted">{description}</p>
        {links?.length ? (
          <nav className="mt-4 flex flex-wrap gap-2" aria-label="Section navigation">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="tab bg-brand-surface2 ring-1 ring-brand-border hover:border-brand-primary/60">
                {l.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      {children}
    </div>
  );
}

/** Breadcrumb nav for SEO. */
export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-brand-muted">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-1.5">
          {it.href ? (
            <Link href={it.href} className="hover:text-brand-primary">{it.label}</Link>
          ) : (
            <span className="text-brand-text">{it.label}</span>
          )}
          {i < items.length - 1 ? <span aria-hidden>/</span> : null}
        </span>
      ))}
    </nav>
  );
}
