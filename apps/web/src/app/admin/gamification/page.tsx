import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { SettingsEditor } from "@/components/settings-editor";

export const metadata: Metadata = { title: "Admin · Gamification" };

export const revalidate = 15;

export default async function AdminGamificationPage() {
  const settings = await prisma.appSetting.findMany({ where: { group: "gamification" }, orderBy: { key: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Gamification</h1>
      <p className="text-sm text-brand-muted">XP and coin rewards — changes apply immediately, no deployment needed.</p>
      <SettingsEditor settings={settings.map((s) => ({ key: s.key, value: s.value, group: s.group }))} />
    </div>
  );
}
