import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getTeams } from "@/lib/data";
import { prisma } from "@sbgg/db";
import { SectionTitle } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { ThemeSelector } from "@/components/theme-selector";

export const metadata: Metadata = { title: "Settings", description: "Manage your Superbowl.gg profile and account." };

export default async function SettingsPage() {
  const session = await requireSession();
  const [profile, teams, favorites, prefs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    getTeams(),
    prisma.userFavoriteTeam.findMany({ where: { userId: session.user.id } }),
    prisma.notificationPreference.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle sub="Public profile, account security and notification preferences">
        <span className="text-brand-text">Settings</span>
      </SectionTitle>
      <ThemeSelector initialTheme={session.user.themePreference} />
      <ProfileForm
        profile={profile ? { bio: profile.bio ?? "", displayName: profile.displayName ?? "", username: profile.username } : null}
        teams={teams.map((t) => ({ id: t.id, abbr: t.abbreviation, name: t.name }))}
        favoriteTeamId={favorites[0]?.teamId ?? ""}
        email={session.user.email}
        prefs={prefs ?? undefined}
      />
    </div>
  );
}
