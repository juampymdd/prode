"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { onboardingSchema } from "@/lib/validations/profile-schema";

const emailSchema = z.object({
  email: z.string().trim().email("Email inválido."),
  next: z
    .string()
    .optional()
    .transform((v) => (v && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard")),
});

export type AuthState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

async function originFromHeaders() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
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

  const supabase = await createClient();
  const origin = await originFromHeaders();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(parsed.data.next!)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    console.error("[sendMagicLinkAction] supabase error", {
      code: error.code,
      status: error.status,
      message: error.message,
    });
    if (error.status === 429) {
      return {
        ok: false,
        error: "Mandaste demasiados links en poco tiempo. Probá de nuevo en unos minutos.",
      };
    }
    return { ok: false, error: "No pudimos enviar el link. Intentá de nuevo." };
  }

  return {
    ok: true,
    message: `Te mandamos un link mágico a ${parsed.data.email}. Abrílo y entrás directo.`,
  };
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
    console.error("[completeOnboardingAction] supabase error", {
      code: error.code,
      message: error.message,
    });
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
      message: metaError.message,
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
