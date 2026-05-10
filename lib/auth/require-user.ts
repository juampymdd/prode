import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAppAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_app_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_app_admin) {
    redirect("/dashboard?error=admin_required");
  }
  return user;
}
