import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getUserWithProfile,
  isProfileComplete,
  isProfileDisabled,
} from "@/lib/auth/get-user";

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

export async function requireCompletedProfile() {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");
  if (!isProfileComplete(profile)) redirect("/onboarding");
  return { user, profile: profile! };
}

export async function requireAppAdmin() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_app_admin, name, birthdate, terms_accepted_at, disabled_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isProfileComplete(profile)) redirect("/onboarding");
  if (isProfileDisabled(profile)) {
    redirect("/dashboard?error=account_disabled");
  }
  if (!profile?.is_app_admin) {
    redirect("/dashboard?error=admin_required");
  }
  return user;
}
