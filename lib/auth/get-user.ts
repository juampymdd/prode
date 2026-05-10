import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserWithProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, name, avatar_url, is_app_admin, created_at")
    .eq("user_id", user.id)
    .maybeSingle();

  return { user, profile };
}
