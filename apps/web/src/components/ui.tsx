import Link from "next/link";
import type { ReactNode } from "react";

export function Card({ children, className = "", hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`card ${hover ? "card-hover" : ""} ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "slate", className = "" }: { children: ReactNode; tone?: "slate" | "green" | "red" | "blue" | "gold" | "indigo"; className?: string }) {
  const tones: Record<string, string> = {
    slate: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
    green: "bg-brand-success/15 text-brand-success ring-1 ring-brand-success/30",
    red: "bg-brand-danger/15 text-brand-danger ring-1 ring-brand-danger/30",
    blue: "bg-brand-primary/15 text-brand-primary ring-1 ring-brand-primary/30",
    gold: "bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30",
    indigo: "bg-brand-secondary/15 text-brand-secondary ring-1 ring-brand-secondary/30",
  };
  return <span className={`badge ${tones[tone] ?? tones.slate} ${className}`}>{children}</span>;
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="font-display text-xl font-semibold text-brand-text sm:text-2xl">{children}</h2>
        {sub ? <p className="mt-1 text-sm text-brand-muted">{sub}</p> : null}
      </div>
    </div>
  );
}

/** Team identity block — abbreviation badge with team colors (no logos — legal-safe). */
export function TeamBadge({ abbr, name, color, size = "md", link }: { abbr: string; name?: string; color?: string | null; size?: "sm" | "md" | "lg"; link?: string }) {
  const box =
    size === "lg" ? "h-16 w-16 text-2xl" : size === "sm" ? "h-8 w-8 text-[11px]" : "h-11 w-11 text-sm";
  const inner = (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`${box} inline-flex items-center justify-center rounded-lg font-display font-bold text-white ring-1 ring-white/15`}
        style={{ backgroundColor: color || "#1e293b" }}
      >
        {abbr}
      </span>
      {name ? <span className="text-sm font-medium text-brand-text">{name}</span> : null}
    </span>
  );
  return link ? <Link href={link}>{inner}</Link> : inner;
}

export function OddsCell({ price, point, label }: { price?: number | null; point?: number | null; label?: string }) {
  const fmt = (p: number) => (p >= 2 ? `+${Math.round((p - 1) * 100)}` : `${Math.round(-100 / (p - 1))}`);
  return (
    <span className="inline-flex flex-col items-center rounded-lg border border-brand-border bg-brand-surface2 px-2.5 py-1.5">
      {label ? <span className="text-[10px] uppercase tracking-wide text-brand-muted">{label}</span> : null}
      <span className="scoreboard-num text-sm text-brand-text">
        {price != null ? fmt(price) : "—"}
        {point != null ? <span className="text-brand-muted"> {point > 0 ? "+" : ""}{point}</span> : null}
      </span>
    </span>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 border-dashed py-12 text-center">
      <p className="font-display text-lg text-brand-text">{title}</p>
      {body ? <p className="max-w-sm text-sm text-brand-muted">{body}</p> : null}
    </div>
  );
}
