import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { APIError, createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { prisma } from "@sbgg/db";
import { z } from "zod";

type TelegramScalar = string | number | boolean;
export type TelegramLoginPayload = Record<string, TelegramScalar>;

const telegramBody = z.record(z.string(), z.union([z.string(), z.number(), z.boolean()]));
const MAX_AUTH_AGE_SECONDS = 15 * 60;

function scalarFields(payload: TelegramLoginPayload): Record<string, string> {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)]));
}

export function verifyTelegramPayload(
  payload: TelegramLoginPayload,
  botToken: string,
  nowSeconds = Math.floor(Date.now() / 1_000),
): Record<string, string> | null {
  const fields = scalarFields(payload);
  if (!/^\d+$/.test(fields.id ?? "") || !/^\d+$/.test(fields.auth_date ?? "") || !/^[a-f0-9]{64}$/i.test(fields.hash ?? "")) {
    return null;
  }
  const ageSeconds = nowSeconds - Number(fields.auth_date);
  if (!Number.isFinite(ageSeconds) || ageSeconds < 0 || ageSeconds > MAX_AUTH_AGE_SECONDS) return null;

  const dataCheckString = Object.entries(fields)
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHash("sha256").update(botToken).digest();
  const expected = createHmac("sha256", secretKey).update(dataCheckString).digest();
  const actual = Buffer.from(fields.hash!, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? fields : null;
}

function telegramPhoto(value: string | undefined): string | null {
  if (!value || value.length > 2_048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function telegramName(fields: Record<string, string>): string {
  const combined = [fields.first_name, fields.last_name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  return (combined || fields.username || "Telegram user").slice(0, 120);
}

/** Better Auth plugin for Telegram's official, HMAC-signed Login Widget. */
export function telegramLogin(options: { botToken: string }) {
  return {
    id: "telegram-login",
    endpoints: {
      signInTelegram: createAuthEndpoint("/sign-in/telegram", {
        method: "POST",
        body: telegramBody,
      }, async (context) => {
        const fields = verifyTelegramPayload(context.body, options.botToken);
        if (!fields) throw new APIError("UNAUTHORIZED", { message: "Telegram login data could not be verified." });

        const telegramId = fields.id!;
        const email = `telegram-${telegramId}@auth.superbowl.gg`;
        const name = telegramName(fields);
        const image = telegramPhoto(fields.photo_url);

        const user = await prisma.$transaction(async (transaction) => {
          const linkedAccount = await transaction.account.findFirst({
            where: { providerId: "telegram", accountId: telegramId },
            include: { user: true },
          });
          if (linkedAccount) {
            if (linkedAccount.user.status !== "ACTIVE") throw new APIError("FORBIDDEN", { message: "This account is not active." });
            return transaction.user.update({
              where: { id: linkedAccount.userId },
              data: { name, ...(image ? { image } : {}) },
            });
          }

          const existing = await transaction.user.findUnique({ where: { email } });
          if (existing && existing.status !== "ACTIVE") throw new APIError("FORBIDDEN", { message: "This account is not active." });
          const resolvedUser = existing ?? await transaction.user.create({
            data: {
              email,
              emailVerified: true,
              name,
              image,
              status: "ACTIVE",
            },
          });
          await transaction.account.create({
            data: {
              userId: resolvedUser.id,
              providerId: "telegram",
              accountId: telegramId,
            },
          });
          return resolvedUser;
        });

        const session = await context.context.internalAdapter.createSession(user.id);
        if (!session) throw new APIError("INTERNAL_SERVER_ERROR", { message: "A session could not be created." });
        await setSessionCookie(context, { session, user: { ...user, name: user.name ?? name } });
        return context.json({ ok: true, redirectTo: "/auth/social-complete" });
      }),
    },
  };
}
