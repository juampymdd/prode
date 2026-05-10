"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAppAdmin } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";

export type SignupAdminState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

const idSchema = z.object({ id: z.string().uuid("Solicitud inválida.") });
const rejectSchema = idSchema.extend({
  reason: z.string().trim().max(280).optional().nullable(),
});

async function originFromHeaders() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

/**
 * Approve a pending signup request:
 *   1. Create the auth.users row via admin API (sends invite email with a
 *      one-time link that completes signup).
 *   2. Update the auto-created profile with the data the user submitted.
 *   3. Mark the request as approved.
 *
 * Failure paths leave the request as 'pending' so the admin can retry.
 */
export async function approveSignupRequestAction(
  _prev: SignupAdminState,
  formData: FormData,
): Promise<SignupAdminState> {
  const reviewer = await requireAppAdmin();
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };

  const admin = createAdminClient();

  const { data: request, error: fetchError } = await admin
    .from("signup_requests")
    .select("id, email, name, birthdate, terms_accepted_at, status")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (fetchError || !request) {
    return { ok: false, error: "No encontramos esa solicitud." };
  }
  if (request.status === "approved") {
    return { ok: false, error: "Esta solicitud ya estaba aprobada." };
  }

  const origin = await originFromHeaders();
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}`;

  const { data: invited, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(request.email, {
      redirectTo,
      data: { full_name: request.name, display_name: request.name },
    });

  if (inviteError || !invited.user) {
    console.error("[approveSignupRequestAction] inviteUserByEmail failed", {
      message: inviteError?.message,
      status: inviteError?.status,
    });
    return {
      ok: false,
      error: `No pudimos enviar la invitación: ${inviteError?.message ?? "error desconocido"}.`,
    };
  }

  // The on_auth_user_created trigger created a profile row. Fill it with
  // the data the user actually submitted.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      name: request.name,
      birthdate: request.birthdate,
      terms_accepted_at: request.terms_accepted_at,
    })
    .eq("user_id", invited.user.id);

  if (profileError) {
    console.error("[approveSignupRequestAction] profile update failed", profileError);
    // Don't fail the whole approval — auth user exists and email was sent.
    // Admin can fix the profile later if needed.
  }

  const { error: updateError } = await admin
    .from("signup_requests")
    .update({
      status: "approved",
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: null,
    })
    .eq("id", request.id);

  if (updateError) {
    console.error("[approveSignupRequestAction] status update failed", updateError);
    return {
      ok: false,
      error: "Cuenta creada y mail enviado, pero no pudimos marcar la solicitud como aprobada. Refrescá la lista.",
    };
  }

  revalidatePath("/admin/signup-requests");
  return { ok: true, message: `Aprobada. Le mandamos el link a ${request.email}.` };
}

export async function rejectSignupRequestAction(
  _prev: SignupAdminState,
  formData: FormData,
): Promise<SignupAdminState> {
  const reviewer = await requireAppAdmin();
  const parsed = rejectSchema.safeParse({
    id: formData.get("id"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };

  const admin = createAdminClient();
  const { error } = await admin
    .from("signup_requests")
    .update({
      status: "rejected",
      reviewed_by: reviewer.id,
      reviewed_at: new Date().toISOString(),
      reject_reason: parsed.data.reason ?? null,
    })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[rejectSignupRequestAction] update failed", error);
    return { ok: false, error: "No pudimos rechazar la solicitud." };
  }
  revalidatePath("/admin/signup-requests");
  return { ok: true, message: "Solicitud rechazada." };
}

export async function deleteSignupRequestAction(
  _prev: SignupAdminState,
  formData: FormData,
): Promise<SignupAdminState> {
  await requireAppAdmin();
  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]!.message };

  const admin = createAdminClient();
  const { error } = await admin
    .from("signup_requests")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[deleteSignupRequestAction] delete failed", error);
    return { ok: false, error: "No pudimos eliminar la solicitud." };
  }
  revalidatePath("/admin/signup-requests");
  return { ok: true, message: "Solicitud eliminada. El email queda libre." };
}
