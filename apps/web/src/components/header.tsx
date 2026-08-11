"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { SessionUserView } from "@/lib/session";

const NAV = [
  { href: "/games", label: "Games" },
  { href: "/predictions", label: "Predictions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/nfl", label: "Stats" },
  { href: "/marketplace", label: "Marketplace" },
];

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/games", label: "Games", icon: "📅" },
  { href: "/predict", label: "Predict", icon: "🎯", highlight: true },
  { href: "/leaderboard", label: "Board", icon: "🏆" },
  { href: "/wallet", label: "Profile", icon: "👤" },
];

export function SiteHeader({ user }: { user: SessionUserView | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Superbowl home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary font-display text-lg font-bold text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.45)]">
            SB
          </span>
          <span className="font-display text-xl font-semibold tracking-wide text-brand-text">
            SUPERBOWL<span className="text-brand-primary">.GG</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`tab ${isActive(n.href) ? "tab-active" : ""}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/super-bowl" className={`tab ${isActive("/super-bowl") ? "tab-active" : ""}`}>
            Super Bowl
          </Link>
          <Link href="/search" className={`tab ${isActive("/search") ? "tab-active" : ""}`} aria-label="Search">
            Search
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/wallet" className="hidden items-center gap-1.5 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm font-semibold text-brand-gold transition-colors hover:border-brand-gold/50 sm:flex">
                <span aria-hidden>◎</span>
                {user.coins.toLocaleString()}
              </Link>
              <Link href="/notifications" className="hidden rounded-lg p-2 text-brand-muted transition-colors hover:text-brand-text sm:block" aria-label="Notifications">
                <span aria-hidden>🔔</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-brand-border bg-brand-surface px-2.5 text-sm font-medium text-brand-text transition-colors hover:border-brand-primary/50"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-secondary/30 text-xs font-bold text-brand-secondary">
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate lg:block">{user.name ?? user.username ?? user.email}</span>
                  <span aria-hidden>▾</span>
                </button>
                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-brand-border bg-brand-surface p-1.5 shadow-xl">
                    <Link href={`/users/${user.username ?? "me"}`} className="block rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                      My profile
                    </Link>
                    <Link href="/wallet" className="block rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                      Wallet
                    </Link>
                    <Link href="/achievements" className="block rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                      Achievements
                    </Link>
                    <Link href="/referrals" className="block rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                      Referrals
                    </Link>
                    <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm text-brand-text hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                      Settings
                    </Link>
                    {user.isAdmin ? (
                      <Link href="/admin" className="block rounded-lg px-3 py-2 text-sm text-brand-secondary hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>
                        Admin
                      </Link>
                    ) : null}
                    <button onClick={signOut} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-brand-danger hover:bg-brand-surface2">
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/sign-in" className="btn-ghost hidden sm:inline-flex">
                Sign In
              </Link>
              <Link href="/auth/sign-up" className="btn-primary">
                Join Free
              </Link>
            </>
          )}
        </div>
      </div>

      {/* mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-border bg-brand-bg/95 backdrop-blur md:hidden" aria-label="Mobile">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
                isActive(n.href) ? "text-brand-primary" : "text-brand-muted"
              } ${n.highlight ? "-mt-4" : ""}`}
            >
              {n.highlight ? (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-xl text-slate-950 shadow-[0_0_18px_rgba(56,189,248,0.5)]">{n.icon}</span>
              ) : (
                <span className="text-lg" aria-hidden>{n.icon}</span>
              )}
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="h-16 md:hidden" />
    </header>
  );
}
