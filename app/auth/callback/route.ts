import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete } from "@/lib/auth/get-user";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/dashboard";

  const supabase = await createClient();

  let exchanged = false;

  // Newer @supabase/ssr flow: ?code=...
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) exchanged = true;
  }

  // Legacy magic-link flow: ?token_hash=...&type=magiclink
  if (!exchanged && tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
    });
    if (!error) exchanged = true;
  }

  if (!exchanged) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", origin));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, birthdate, terms_accepted_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isProfileComplete(profile)) {
    const onboardingUrl = new URL("/onboarding", origin);
    if (next !== "/dashboard") onboardingUrl.searchParams.set("next", next);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.redirect(new URL(next, origin));
}
