"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAuthClient } from "better-auth/react";
import { TelegramLoginButton } from "@/components/telegram-login-button";

const authClient = createAuthClient();

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

export function AuthForm({ mode, initialRef, returnTo, googleEnabled, telegramBotUsername, initialError }: {
  mode: "sign-in" | "sign-up";
  initialRef?: string;
  returnTo: string;
  googleEnabled?: boolean;
  telegramBotUsername?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const callbackParams = new URLSearchParams({ next: returnTo });
  if (initialRef) callbackParams.set("ref", initialRef);
  const socialCallbackURL = `/auth/social-complete?${callbackParams.toString()}`;
  const verificationCallbackURL = `/auth/verify-email?${callbackParams.toString()}`;
  const hasSocialProviders = googleEnabled || Boolean(telegramBotUsername);

  const handleSocialError = useCallback((message: string) => {
    setSocialLoading(false);
    setError(message);
  }, []);

  async function continueWithGoogle() {
    setError(null);
    setSocialLoading(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: socialCallbackURL,
        newUserCallbackURL: socialCallbackURL,
        errorCallbackURL: `/auth/sign-in?error=oauth&next=${encodeURIComponent(returnTo)}`,
      });
      if (result.error) handleSocialError(result.error.message ?? "Google sign-in could not be started.");
    } catch (caught) {
      handleSocialError(caught instanceof Error ? caught.message : "Google sign-in is temporarily unavailable.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "sign-up") {
        const res = await authClient.signUp.email({
          email,
          password,
          name: username || email.split("@")[0]!,
          callbackURL: verificationCallbackURL,
        });
        if (res.error) {
          setError(res.error.message ?? "Sign up failed");
        } else {
          setInfo("Account created. Check your inbox and verify your email to continue.");
        }
      } else {
        const res = await authClient.signIn.email({ email, password, callbackURL: returnTo });
        if (res.error) {
          setError(res.error.message ?? "Invalid credentials");
        } else {
          router.push(returnTo);
          router.refresh();
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (!email) return;
    setResending(true);
    setError(null);
    const result = await authClient.sendVerificationEmail({ email, callbackURL: verificationCallbackURL });
    if (result.error) setError(result.error.message ?? "Verification email could not be sent.");
    else setInfo("A fresh verification link is on its way. It expires in one hour.");
    setResending(false);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-semibold text-brand-text">
          {mode === "sign-in" ? "Log in to Superbowl" : "Join Superbowl — Free"}
        </h1>
        <p className="mt-1 text-sm text-brand-muted">
          {mode === "sign-in" ? "Welcome back. Your record is waiting." : "Create an account and get 1000 free coins."}
        </p>
        {returnTo.startsWith("/predict?") ? <p className="mt-4 rounded-xl border border-brand-primary/25 bg-brand-primary/10 px-3 py-2 text-sm text-brand-text">Your game and outcome are saved. You&apos;ll return to the pick after authentication.</p> : null}

        {hasSocialProviders ? (
          <div className="mt-6 space-y-3">
            {googleEnabled ? <button type="button" onClick={() => void continueWithGoogle()} disabled={socialLoading || loading} className="btn-secondary min-h-12 w-full"><GoogleIcon /> {socialLoading ? "Opening Google…" : "Continue with Google"}</button> : null}
            {telegramBotUsername ? <div className="rounded-xl border border-brand-border bg-brand-surface px-3 py-2"><TelegramLoginButton botUsername={telegramBotUsername} callbackURL={socialCallbackURL} onError={handleSocialError} /></div> : null}
            <div className="flex items-center gap-3 pt-1"><span className="h-px flex-1 bg-brand-border" /><span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">or use email</span><span className="h-px flex-1 bg-brand-border" /></div>
          </div>
        ) : null}

        <form onSubmit={submit} className={`${hasSocialProviders ? "mt-4" : "mt-6"} space-y-4`}>
          {mode === "sign-up" ? (
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" className="input" placeholder="e.g. joelk" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))} required minLength={3} maxLength={24} autoComplete="username" />
            </div>
          ) : null}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" placeholder={mode === "sign-up" ? "12+ characters" : "Your password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} />
              {mode === "sign-up" ? <p className="mt-1.5 text-xs leading-5 text-brand-muted">Use at least 12 characters. A longer passphrase is easiest to remember and harder to guess.</p> : null}
          </div>

          {error ? <p className="rounded-lg border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-sm text-brand-danger" role="alert">{error}</p> : null}
          {info ? <p className="rounded-lg border border-brand-success/40 bg-brand-success/10 px-3 py-2 text-sm text-brand-success">{info}</p> : null}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Please wait…" : mode === "sign-in" ? "Log In" : "Create Account"}
          </button>
          {email && (info || error?.toLowerCase().includes("verif")) ? <button type="button" disabled={resending} onClick={() => void resendVerification()} className="btn-secondary w-full">{resending ? "Sending…" : "Resend verification email"}</button> : null}
        </form>

        <div className="mt-4 text-center text-sm text-brand-muted">
          {mode === "sign-in" ? (
            <>
              <Link href="/auth/forgot-password" className="text-brand-primary hover:underline">Forgot password?</Link>
              <span className="mx-2">·</span>
              <Link href={`/auth/sign-up?next=${encodeURIComponent(returnTo)}`} className="text-brand-primary hover:underline">Create account</Link>
            </>
          ) : (
            <Link href={`/auth/sign-in?next=${encodeURIComponent(returnTo)}`} className="text-brand-primary hover:underline">Already have an account? Log in</Link>
          )}
        </div>
      </div>
    </div>
  );
}
