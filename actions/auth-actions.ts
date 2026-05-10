"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/profile-schema";
import { trustedOrigin } from "@/lib/security/origin";
import { clientIp, throttle } from "@/lib/security/throttle";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email inválido."),
  next: z
    .string()
    .optional()
    .transform((v) => (v && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export type AuthState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

// Identical response for every non-success path on the public form, so an
// attacker can't tell pending / rejected / unknown email apart.
function genericResponse(email: string): AuthState {
  return {
    ok: true,
    message: `Si esa cuenta existe, te mandamos un link mágico a ${email}. Revisá tu bandeja y el spam.`,
  };
}

export async function sendMagicLinkAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const ip = await clientIp();
  const gate = await throttle("magic_link", ip);
  if (!gate.allowed) {
    return {
      ok: false,
      error: "Demasiados intentos. Esperá unos minutos antes de pedir otro link.",
    };
  }

  const supabase = await createClient();
  const origin = await trustedOrigin();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(parsed.data.next!)}`;
  const email = parsed.data.email;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
  });

  if (!error) {
    return {
      ok: true,
      message: `Te mandamos un link mágico a ${email}. Abrílo y entrás directo.`,
    };
  }

  console.error("[sendMagicLinkAction] supabase error", {
    code: error.code,
    status: error.status,
  });

  if (error.status === 429) {
    return {
      ok: false,
      error: "Mandaste demasiados links en poco tiempo. Probá de nuevo en unos minutos.",
    };
  }

  // Any other failure (unknown email, signups disabled, otp_disabled, etc.)
  // gets the same generic response to prevent account / signup enumeration.
  return genericResponse(email);
}

export async function completeOnboardingAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = onboardingSchema.safeParse({
    fullName: formData.get("fullName"),
    birthdate: formData.get("birthdate"),
    acceptTerms: formData.get("acceptTerms") ?? false,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Iniciá sesión de nuevo." };

  const { error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.fullName,
      birthdate: parsed.data.birthdate,
      terms_accepted_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("[completeOnboardingAction] update failed", { code: error.code });
    return { ok: false, error: "No pudimos guardar tus datos. Intentá de nuevo." };
  }

  // Mirror the name into auth.users.user_metadata so it shows up in the
  // Supabase dashboard. Best-effort: the canonical name lives in profiles.
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      display_name: parsed.data.fullName,
      full_name: parsed.data.fullName,
    },
  });
  if (metaError) {
    console.warn("[completeOnboardingAction] could not sync user_metadata", {
      code: metaError.code,
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
