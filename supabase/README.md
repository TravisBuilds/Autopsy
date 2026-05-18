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

4. In **Authentication → URL configuration**, add:
   - Site URL: `http://localhost:3000` (or your production URL)
   - Redirect URLs: `http://localhost:3000/auth/callback`

5. Confirm the **lab-pdfs** storage bucket exists (created by migration).

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Display name + email (auto-created on signup) |
| `test_sessions` | Lab panels + JSONB readings + optional PDF path |
| `interventions` | Medications, supplements, etc. |

All tables use Row Level Security (`auth.uid() = user_id`).
