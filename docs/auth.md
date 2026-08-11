# Authentication

Better Auth provides email/password accounts and database sessions. Resend delivers verification and password-reset messages from `EMAIL_FROM`.

## Flow

1. Sign-up validates a username, email and a minimum 12-character password.
2. Better Auth creates the unverified account and sends a verification link through Resend.
3. After verification, `/api/onboarding` atomically creates the profile, wallet, XP, streak, notification preferences and referral code.
4. The welcome XP/coins are idempotent and backed by ledger/event rows.
5. Each server request rechecks the database user status; suspended/banned users lose sessions.

Admin access is role-based. `ADMIN_EMAIL` promotes the matching verified user during session handling; privileged role changes require a super admin, and the last active super admin cannot be demoted.

## Required production values

- two independent random values of at least 32 characters: `AUTH_SECRET`, `AUTH_BETTER_SECRET`
- `RESEND_API_KEY`
- a verified Resend sending domain matching `EMAIL_FROM`
- public HTTPS `APP_URL`/`NEXT_PUBLIC_APP_URL`

No OAuth provider is configured in this release. Email delivery deliberately fails if Resend is missing rather than claiming that a message was sent.
