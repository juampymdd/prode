import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Service-role client. Bypasses RLS — only use from Server Actions /
// route handlers that have already verified caller is an app admin
// (see requireAppAdmin). Never import from client components.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL) — admin client unavailable.",
    );
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
