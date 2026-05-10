"use server";

import { signupRequestSchema } from "@/lib/validations/signup-schema";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignupActionState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

export async function createSignupRequestAction(
  _prev: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
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

  // Admin client bypasses RLS so we can both check duplicates AND insert
  // the row from a public (anon) form. Safe because this server action is
  // the only entry point and we've already validated input.
  const admin = createAdminClient();
  const email = parsed.data.email;

  const { data: existing, error: lookupError } = await admin
    .from("signup_requests")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    console.error("[createSignupRequestAction] lookup failed", lookupError);
    return { ok: false, error: "No pudimos procesar tu solicitud. Probá de nuevo." };
  }

  if (existing) {
    if (existing.status === "pending") {
      return {
        ok: false,
        error: "Ya hay una solicitud pendiente con ese email. Esperá la respuesta del admin.",
      };
    }
    if (existing.status === "approved") {
      return {
        ok: false,
        error: "Ya tenés una cuenta aprobada con ese email. Andá a /login.",
      };
    }
    if (existing.status === "rejected") {
      return {
        ok: false,
        error: "Tu solicitud fue rechazada. Contactá al admin si pensás que es un error.",
      };
    }
  }

  const { error: insertError } = await admin.from("signup_requests").insert({
    email,
    name: parsed.data.fullName,
    birthdate: parsed.data.birthdate,
    terms_accepted_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error("[createSignupRequestAction] insert failed", insertError);
    return {
      ok: false,
      error: "No pudimos registrar tu solicitud. Probá de nuevo.",
    };
  }

  return {
    ok: true,
    message:
      "Tu solicitud quedó pendiente. Te avisamos por mail cuando un admin la apruebe.",
  };
}
