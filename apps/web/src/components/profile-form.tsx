"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationPreference } from "@sbgg/db";

interface ProfileFormProps {
  profile: { bio: string; displayName: string; username: string } | null;
  teams: { id: string; abbr: string; name: string }[];
  favoriteTeamId: string;
  email: string;
  prefs?: Pick<
    NotificationPreference,
    "newFollower" | "followedUserPrediction" | "predictionSettled" | "achievementUnlocked" | "marketplace"
  >;
}

export function ProfileForm({ profile, teams, favoriteTeamId, email, prefs }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [teamId, setTeamId] = useState(favoriteTeamId);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState(email);
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>({
    newFollower: prefs?.newFollower ?? true,
    followedUserPrediction: prefs?.followedUserPrediction ?? true,
    predictionSettled: prefs?.predictionSettled ?? true,
    achievementUnlocked: prefs?.achievementUnlocked ?? true,
    marketplace: prefs?.marketplace ?? true,
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, favoriteTeamId: teamId, email: newEmail !== email ? newEmail : undefined, currentPassword: currentPassword || undefined, newPassword: newPassword || undefined }),
      });
      const body = await res.json().catch(() => ({})) as { error?: string; emailVerificationSent?: boolean };
      if (!res.ok) throw new Error(body.error ?? "Profile save failed");
      const notificationResponse = await fetch("/api/settings/notifications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(notifPrefs) });
      if (!notificationResponse.ok) {
        const notificationBody = await notificationResponse.json().catch(() => ({})) as { error?: string };
        setErr(`Profile saved, but notification preferences failed: ${notificationBody.error ?? "try again"}`);
        return;
      }
      setMsg(body.emailVerificationSent ? "Saved. Check the new inbox to verify the email change." : "Saved ✓");
      setCurrentPassword(""); setNewPassword("");
      router.refresh();
    } catch (cause) {
      setErr(cause instanceof Error ? cause.message : "The network did not respond. Nothing is reported as saved.");
    } finally {
      setBusy(false);
    }
  }

  const toggle = (k: string) => setNotifPrefs((p) => ({ ...p, [k]: !p[k] }));

  return (
    <form onSubmit={save} className="card space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="username">Username</label>
          <input id="username" className="input" value={profile?.username ?? ""} disabled readOnly />
        </div>
        <div>
          <label className="label" htmlFor="displayName">Display name</label>
          <input id="displayName" className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea id="bio" className="input min-h-20" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} placeholder="Short bio shown on your public profile" />
      </div>
      <div>
        <label className="label" htmlFor="team">Favorite team</label>
        <select id="team" className="input" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
          <option value="">— none —</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.abbr} — {t.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 border-t border-brand-border pt-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <p className="mt-1.5 text-xs text-brand-muted">A changed address takes effect only after Better Auth verification.</p>
        </div>
        <div>
          <label className="label" htmlFor="pw">Current password (to change password)</label>
          <input id="pw" type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <label className="label" htmlFor="npw">New password</label>
          <input id="npw" type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={12} autoComplete="new-password" />
          <p className="mt-1.5 text-xs text-brand-muted">Use at least 12 characters.</p>
        </div>
      </div>

      <div className="border-t border-brand-border pt-4">
        <p className="label">Notifications</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["newFollower", "New followers"],
            ["followedUserPrediction", "Predictions from people I follow"],
            ["predictionSettled", "My predictions settling"],
            ["achievementUnlocked", "Achievements"],
            ["marketplace", "Rewards Store & rewards"],
          ].map(([k, label]) => (
            <label key={k} className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-brand-muted">
              <input type="checkbox" checked={notifPrefs[k] ?? true} onChange={() => toggle(k)} className="h-5 w-5 accent-brand-primary" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {msg ? <p className="text-sm text-brand-success">{msg}</p> : null}
      {err ? <p className="text-sm text-brand-danger">{err}</p> : null}
      <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
