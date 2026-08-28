import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@sbgg/db";
import { adminEmails, env } from "@sbgg/core";
import { telegramLogin } from "./telegram";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function trustedAuthUrl(value: string): string {
  const url = new URL(value);
  const appUrl = new URL(env().APP_URL);
  if (url.origin !== appUrl.origin) throw new Error("Authentication email URL has an untrusted origin");
  return url.toString();
}

async function sendTransactionalEmail(input: { to: string; subject: string; action: string; url: string }): Promise<void> {
  const configuration = env();
  if (!configuration.RESEND_API_KEY) throw new Error("Email delivery is unavailable because RESEND_API_KEY is not configured");
  const url = trustedAuthUrl(input.url);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: configuration.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: `<p>${escapeHtml(input.action)}</p><p><a href="${escapeHtml(url)}">${escapeHtml(input.action)}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Resend rejected an authentication email (${response.status})`);
}

/**
 * Better Auth instance — email/password with email verification, forgot/reset
 * password, sessions. Passwords are hashed by Better Auth (scrypt); never
 * stored in plaintext. Additional fields (role, status) are stored on User.
 */
const configuration = env();

export const auth = betterAuth({
  appName: "Superbowl",
  baseURL: configuration.APP_URL,
  trustedOrigins: [configuration.APP_URL],
  secret: configuration.AUTH_BETTER_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  verification: {
    modelName: "verificationToken",
  },
  socialProviders: configuration.AUTH_GOOGLE_ID && configuration.AUTH_GOOGLE_SECRET ? {
    google: {
      clientId: configuration.AUTH_GOOGLE_ID,
      clientSecret: configuration.AUTH_GOOGLE_SECRET,
      scope: ["openid", "email", "profile"],
    },
  } : {},
  plugins: configuration.TELEGRAM_BOT_TOKEN ? [telegramLogin({ botToken: configuration.TELEGRAM_BOT_TOKEN })] : [],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 12,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Reset your Superbowl password",
        action: "Reset your password",
        url,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: "Verify your Superbowl email",
        action: "Verify your email address",
        url,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    afterEmailVerification: async (user) => {
      const isConfiguredAdmin = user.email ? adminEmails().has(user.email) : false;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          status: "ACTIVE",
          ...(isConfiguredAdmin ? { role: "SUPER_ADMIN" as const, isAdmin: true } : {}),
        },
      });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: false,
    },
    additionalFields: {
      role: { type: "string", defaultValue: "USER", input: false },
      isAdmin: { type: "boolean", defaultValue: false, input: false },
      status: { type: "string", defaultValue: "PENDING_VERIFICATION", input: false },
    },
  },
  account: {
    encryptOAuthTokens: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => user.emailVerified ? { data: { ...user, status: "ACTIVE" } } : undefined,
      },
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"],
    },
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: configuration.NODE_ENV === "production",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
