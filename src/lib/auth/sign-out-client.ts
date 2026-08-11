import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";
import { useHealthStore } from "@/stores/health-store";

/** Clear Supabase session, local auth store, and cached health data. */
export async function signOutClient(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" });

  if (isSupabaseConfigured()) {
    await createClient().auth.signOut();
  }

  useAuthStore.getState().signOut();
  useHealthStore.getState().clearAllData();
}
