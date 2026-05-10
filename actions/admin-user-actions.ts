"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAppAdmin } from "@/lib/auth/require-user";
import { trustedOrigin } from "@/lib/security/origin";

const inviteSchema = z.object({
  email: z.string().trim().email("Email inválido."),
});

const deleteUserSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
});

const setUserDisabledSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
  disabled: z.enum(["true", "false"]).transform((v) => v === "true"),
});

const resendInviteSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
});

export type AdminUserActionState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

export async function inviteUserByMagicLinkAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await requireAppAdmin();

  const parsed = inviteSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Email inválido." };
  }

  const supabase = await createClient();
  const origin = await trustedOrigin();
  const redirectTo = `${origin}/auth/callback?next=/dashboard`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    return { ok: false, error: "No pudimos enviar la invitación." };
  }

  revalidatePath("/admin/users");
  return {
    ok: true,
    message: `Invitación enviada a ${parsed.data.email}. Le mandamos un link mágico para entrar.`,
  };
}

export async function deleteUserAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const caller = await requireAppAdmin();

  const parsed = deleteUserSchema.safeParse({
    user_id: formData.get("user_id"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Usuario inválido." };
  }

  if (parsed.data.user_id === caller.id) {
    return { ok: false, error: "No podés eliminar tu propio usuario." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(parsed.data.user_id);

  if (error) {
    return { ok: false, error: `No pudimos borrar al usuario: ${error.message}` };
  }

  revalidatePath("/admin/users");
  revalidatePath("/ranking");
  revalidatePath("/dashboard");
  return { ok: true, message: "Usuario eliminado." };
}

export async function setUserDisabledAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const caller = await requireAppAdmin();

  const parsed = setUserDisabledSchema.safeParse({
    user_id: formData.get("user_id"),
    disabled: formData.get("disabled"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  if (parsed.data.user_id === caller.id) {
    return { ok: false, error: "No podés deshabilitar tu propia cuenta." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ disabled_at: parsed.data.disabled ? new Date().toISOString() : null })
    .eq("user_id", parsed.data.user_id);

  if (error) {
    return {
      ok: false,
      error: `No pudimos actualizar al usuario: ${error.message}`,
    };
  }

  revalidatePath("/admin/users");
  revalidatePath("/ranking");
  revalidatePath("/dashboard");
  return {
    ok: true,
    message: parsed.data.disabled ? "Usuario deshabilitado." : "Usuario habilitado.",
  };
}

export async function resendInviteAction(
  _prev: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  await requireAppAdmin();

  const parsed = resendInviteSchema.safeParse({
    user_id: formData.get("user_id"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Usuario inválido." };
  }

  const admin = createAdminClient();
  const { data: target, error: lookupErr } = await admin.auth.admin.getUserById(
    parsed.data.user_id,
  );
  if (lookupErr || !target?.user?.email) {
    return { ok: false, error: "No encontramos el email del usuario." };
  }

  // Solo reenviamos invitaciones de registro: si el usuario ya validó su
  // email, mandar otro link sería un "magic link de login", flujo distinto.
  if (target.user.email_confirmed_at) {
    return {
      ok: false,
      error: "Este usuario ya validó su email. No hace falta reenviar la invitación.",
    };
  }

  const supabase = await createClient();
  const origin = await trustedOrigin();
  const redirectTo = `${origin}/auth/callback?next=/dashboard`;

  const { error } = await supabase.auth.signInWithOtp({
    email: target.user.email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("rate") || msg.includes("limit")) {
      return {
        ok: false,
        error: "Esperá un minuto antes de reenviar a este email (límite de Supabase).",
      };
    }
    return { ok: false, error: "No pudimos reenviar la invitación." };
  }

  return {
    ok: true,
    message: `Invitación reenviada a ${target.user.email}.`,
  };
}
