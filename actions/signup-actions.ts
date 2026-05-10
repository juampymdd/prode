"use server";

import { signupRequestSchema } from "@/lib/validations/signup-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { clientIp, throttle } from "@/lib/security/throttle";

export type SignupActionState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

// Same response regardless of whether the email is new, pending, approved
// or rejected. Prevents account / state enumeration from the public form.
const GENERIC_SUCCESS: SignupActionState = {
  ok: true,
  message:
    "Recibimos tu solicitud. Si todo da, un admin te aprueba y te llega un mail con el link para entrar.",
};

export async function createSignupRequestAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  // Honeypot: a hidden input filled in by bots, ignored by humans. If it
  // arrives non-empty, return the generic success without writing to the DB
  // so the bot doesn't learn the field name is the tell.
  const hp = (formData.get("hp_url") ?? "").toString().trim();
  if (hp.length > 0) {
    return GENERIC_SUCCESS;
  }

  const parsed = signupRequestSchema.safeParse({
    email: formData.get("email"),
    fullName: formData.get("fullName"),
    birthdate: formData.get("birthdate"),
    acceptTerms: formData.get("acceptTerms"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    };
  }

  const ip = await clientIp();
  const gate = await throttle("signup", ip);
  if (!gate.allowed) {
    return {
      ok: false,
      error: "Demasiados intentos. Esperá unos minutos antes de pedir acceso de nuevo.",
    };
  }

  const admin = createAdminClient();
  const email = parsed.data.email;

  const { data: existing, error: lookupError } = await admin
    .from("signup_requests")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[createSignupRequestAction] lookup failed", { code: lookupError.code });
    return { ok: false, error: "No pudimos procesar tu solicitud. Probá de nuevo." };
  }

  // If a row already exists in any state, respond identically to a fresh
  // insert. The admin sees duplicates in the queue; the user gets one
  // honest message regardless.
  if (existing) {
    return GENERIC_SUCCESS;
  }

  const { error: insertError } = await admin.from("signup_requests").insert({
    email,
    name: parsed.data.fullName,
    birthdate: parsed.data.birthdate,
    terms_accepted_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("[createSignupRequestAction] insert failed", { code: insertError.code });
    return {
      ok: false,
      error: "No pudimos registrar tu solicitud. Probá de nuevo.",
    };
  }

  return GENERIC_SUCCESS;
}
