# Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Copy **Project URL** and **anon public** key into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run the schema in the SQL Editor (or via CLI):

   ```bash
   # From project root, if using Supabase CLI:
   supabase db push
   ```

   Or paste `migrations/001_initial_schema.sql` into **SQL Editor → New query → Run**.

   Then run `migrations/002_genome_schema.sql` for genome tables,
   and `migrations/003_whoop_schema.sql` for WHOOP tokens + daily snapshots.

4. In **Authentication → URL configuration**, set:
   - **Site URL:** `https://pulsecheck.space` (**not** `http://localhost:3000` — if `redirectTo` is rejected, emails become `http://localhost:3000/?code=...`)
   - **Redirect URLs** (add all that apply; wildcards recommended):
     - `https://pulsecheck.space/**`
     - `https://pulsecheck.space/auth/callback`
     - `https://pulsecheck.space/auth/reset-password`
     - `http://localhost:3000/**` (local dev)
     - `http://localhost:3000/auth/callback` (local dev)
     - `http://localhost:3000/auth/reset-password` (local dev)

   The app sends `redirectTo` as `https://pulsecheck.space/auth/callback` with **no query string** (Supabase rejects `?next=` URLs and falls back to Site URL).

5. Password reset flow in the app:
   - **Forgot password:** `/login/forgot-password` → email link → `/auth/callback` → `/auth/reset-password` → set new password
   - **Signed in:** **Account** in the sidebar → `/settings` → change password without email

6. Confirm the **lab-pdfs** storage bucket exists (created by migration).

## SendGrid SMTP (auth emails)

Built-in Supabase mail is **2 emails/hour** and is not for production. Password reset, signup confirm, and magic links should go through SendGrid.

### 1. SendGrid

1. Sign up: [signup.sendgrid.com](https://signup.sendgrid.com/)
2. Verify sender identity (pick one):
   - **Recommended:** [Domain Authentication](https://app.sendgrid.com/settings/sender_auth) for `pulsecheck.space` (add the CNAMEs SendGrid shows to DNS).
   - Faster for testing: [Single Sender Verification](https://app.sendgrid.com/settings/sender_auth/senders/new) for `noreply@pulsecheck.space` (or any inbox you control).
3. Create an API key: [Settings → API Keys](https://app.sendgrid.com/settings/api_keys) → **Restricted Access** → enable **Mail Send**. Copy it once (`SG.…`).

### 2. Supabase SMTP

Open [Authentication → SMTP](https://supabase.com/dashboard/project/vlwtjcgqahuqxgmixueu/auth/smtp) and enable custom SMTP:

| Field | Value |
| --- | --- |
| Sender email | `noreply@pulsecheck.space` (must match a verified SendGrid sender/domain) |
| Sender name | `Pulse Check` |
| Host | `smtp.sendgrid.net` |
| Port | `587` |
| Username | `apikey` (the literal word, not your SendGrid login) |
| Password | your SendGrid API key (`SG.…`) |

Save. Auth emails now go through SendGrid.

### 3. Raise the rate limit

Custom SMTP starts at **30 emails/hour**. Increase it at [Authentication → Rate Limits](https://supabase.com/dashboard/project/vlwtjcgqahuqxgmixueu/auth/rate-limits) (**emails sent**). For early production, **100–200/hour** is plenty.

### 4. Test

1. Wait a minute after saving SMTP.
2. On [pulsecheck.space/login/forgot-password](https://pulsecheck.space/login/forgot-password) request a reset.
3. Confirm the email **From** is `Pulse Check <noreply@pulsecheck.space>` and the link is `https://pulsecheck.space/auth/callback…`, not localhost.

If SendGrid shows the message as delivered but it is missing, check spam. If Supabase returns SMTP errors, the sender address is not verified or the API key lacks **Mail Send**.

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Display name + email (auto-created on signup) |
| `test_sessions` | Lab panels + JSONB readings + optional PDF path |
| `interventions` | Medications, supplements, etc. |
| `genome_imports` | One row per genome JSON upload (metadata) |
| `genome_variants` | Interpreted variants linked to an import |
| `whoop_connections` | Per-user WHOOP OAuth tokens (reconnect without wiping history) |
| `whoop_snapshots` | One scored day per user; upserted on sync |

All tables use Row Level Security (`auth.uid() = user_id`).

## Genome import API

- `POST /api/genome/import` — multipart `file` (JSON array) or raw JSON body; replaces prior import
- `GET /api/genome/variants` — latest import + variants for the signed-in user
