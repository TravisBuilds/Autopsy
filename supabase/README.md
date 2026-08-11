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

   Then run `migrations/002_genome_schema.sql` for genome tables.

4. In **Authentication → URL configuration**, set:
   - **Site URL:** `https://pulsecheck.space` (not localhost — Supabase emails use this as the default base)
   - **Redirect URLs** (add all that apply):
     - `https://pulsecheck.space/auth/callback`
     - `https://pulsecheck.space/auth/reset-password`
     - `http://localhost:3000/auth/callback` (local dev)
     - `http://localhost:3000/auth/reset-password` (local dev)

5. Password reset flow in the app:
   - **Forgot password:** `/login/forgot-password` → email link → `/auth/callback?next=/auth/reset-password` → set new password
   - **Signed in:** **Account** in the sidebar → `/settings` → change password without email

6. Confirm the **lab-pdfs** storage bucket exists (created by migration).

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Display name + email (auto-created on signup) |
| `test_sessions` | Lab panels + JSONB readings + optional PDF path |
| `interventions` | Medications, supplements, etc. |
| `genome_imports` | One row per genome JSON upload (metadata) |
| `genome_variants` | Interpreted variants linked to an import |

All tables use Row Level Security (`auth.uid() = user_id`).

## Genome import API

- `POST /api/genome/import` — multipart `file` (JSON array) or raw JSON body; replaces prior import
- `GET /api/genome/variants` — latest import + variants for the signed-in user
