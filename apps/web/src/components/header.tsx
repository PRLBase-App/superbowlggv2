"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ComponentType } from "react";
import { Bell, CalendarDays, Coins, Home, Newspaper, Search, ShieldCheck, UserRound, WandSparkles } from "lucide-react";
import type { SessionUserView } from "@/lib/session";

const NAV = [
  { href: "/games", label: "Games" },
  { href: "/predictions", label: "Predictions" },
  { href: "/nfl/news", label: "NFL News" },
  { href: "/blog", label: "Analysis" },
  { href: "/nfl/stats", label: "Stats" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/super-bowl", label: "Super Bowl LXI" },
];

const MOBILE_NAV: { href: string; label: string; icon: ComponentType<{ className?: string }>; highlight?: boolean }[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/games", label: "Schedule", icon: CalendarDays },
  { href: "/predict", label: "Predict", icon: WandSparkles, highlight: true },
  { href: "/nfl/news", label: "News", icon: Newspaper },
  { href: "/wallet", label: "Profile", icon: UserRound },
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
    <header className="sticky top-0 z-50 shadow-[0_4px_20px_rgba(19,21,32,0.14)]">
      <div className="hidden border-b border-white/10 bg-[#0d393a] text-white md:block">
        <div className="mx-auto flex h-8 max-w-[1440px] items-center justify-between px-6 text-[11px] font-semibold uppercase tracking-[0.12em]">
          <span className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> 2026 NFL season · Super Bowl LXI in 2027</span>
          <span className="text-white/70">Schedule and statistics powered by real provider data</span>
        </div>
      </div>
      <div className="border-b border-white/10 bg-brand-nav text-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Superbowl.gg home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-0.5 shadow-[0_0_20px_rgba(62,125,213,0.34)] transition-transform duration-200 group-hover:scale-[1.04] sm:h-11 sm:w-11">
              <Image src="/logo.svg" alt="" width={44} height={44} priority className="h-full w-full object-contain" />
            </span>
            <span className="text-[17px] font-black leading-none tracking-[-0.055em] text-white sm:text-[21px]">
              superbowl<span className="text-[#4f7dff]">.gg</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(item.href) ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/7 hover:text-white"}`}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/search" className="rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Search teams, players and games"><Search className="h-5 w-5" /></Link>
            {user ? (
              <>
                <Link href="/wallet" className="hidden items-center gap-1.5 rounded-lg border border-white/15 bg-white/8 px-3 py-1.5 text-sm font-semibold text-[#ffd36a] transition hover:bg-white/12 sm:flex">
                  <Coins className="h-4 w-4" />{user.coins.toLocaleString()}
                </Link>
                <Link href="/notifications" className="hidden rounded-lg p-2 text-white/65 transition hover:bg-white/10 hover:text-white sm:block" aria-label="Notifications"><Bell className="h-5 w-5" /></Link>
                <div className="relative">
                  <button onClick={() => setMenuOpen((open) => !open)} className="flex h-9 items-center gap-2 rounded-lg border border-white/15 bg-white/8 px-2.5 text-sm font-medium text-white transition hover:bg-white/12" aria-expanded={menuOpen} aria-label="Account menu">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary text-xs font-bold text-white">{(user.name ?? user.email)[0]?.toUpperCase()}</span>
                    <span className="hidden max-w-28 truncate lg:block">{user.name ?? user.username ?? user.email}</span>
                  </button>
                  {menuOpen ? (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-brand-border bg-white p-1.5 text-brand-text shadow-2xl">
                      <Link href={`/users/${user.username ?? "me"}`} className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>My predictor profile</Link>
                      <Link href="/wallet" className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>Wallet and rewards</Link>
                      <Link href="/achievements" className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>Achievements</Link>
                      <Link href="/settings" className="block rounded-xl px-3 py-2 text-sm hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>Account settings</Link>
                      {user.isAdmin ? <Link href="/admin" className="block rounded-xl px-3 py-2 text-sm text-brand-secondary hover:bg-brand-surface2" onClick={() => setMenuOpen(false)}>Admin dashboard</Link> : null}
                      <button onClick={signOut} className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-brand-danger hover:bg-red-50">Sign out</button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/sign-in" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white sm:inline-flex">Sign in</Link>
                <Link href="/auth/sign-up" className="rounded-xl bg-brand-primary px-3 py-2 text-sm font-bold text-white shadow-lg transition hover:bg-[#2463bc] sm:px-4">Join free</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-brand-border bg-white/95 shadow-[0_-8px_25px_rgba(19,21,32,0.10)] backdrop-blur md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 py-2 text-[10px] font-semibold ${isActive(item.href) ? "text-brand-primary" : "text-brand-muted"} ${item.highlight ? "-mt-4" : ""}`}>
                {item.highlight ? <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-[0_8px_20px_rgba(62,125,213,0.35)]"><Icon className="h-5 w-5" /></span> : <Icon className="h-5 w-5" />}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
