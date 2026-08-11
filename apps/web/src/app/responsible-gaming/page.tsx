import type { Metadata } from "next";

export const metadata: Metadata = { title: "Responsible Gaming", description: "Responsible gaming resources and our policy." };

export default function ResponsibleGamingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-brand-text">Responsible Gaming</h1>
      <div className="space-y-4 text-sm leading-relaxed text-brand-muted">
        <p>
          Superbowl.gg is a sports prediction community. We do not take bets, run a sportsbook, or process real-money wagers.
          All coins on the platform are virtual and cannot be withdrawn for cash.
        </p>
        <p>
          Some partner offers link to licensed sportsbook operators. If you choose to visit them, please do so responsibly:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Only gamble with money you can afford to lose.</li>
          <li>Set deposit and time limits before you start.</li>
          <li>Never chase losses.</li>
          <li>Gambling is strictly 21+ in the US and 18+ elsewhere where legal.</li>
          <li>If gambling stops being fun, take a break.</li>
        </ul>
        <p>
          If you or someone you know has a gambling problem, help is available 24/7:
          <br />
          <strong className="text-brand-text">National Problem Gambling Helpline (US): 1-800-GAMBLER</strong>
          <br />
          <a className="text-brand-primary hover:underline" href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer">ncpgambling.org</a>
        </p>
        <p>Never use phrases like &quot;guaranteed win&quot; — nobody can guarantee sports outcomes.</p>
      </div>
    </div>
  );
}
