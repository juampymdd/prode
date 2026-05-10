"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAppAdmin } from "@/lib/auth/require-user";

const inviteSchema = z.object({
  email: z.string().trim().email("Email inválido."),
});

const deleteUserSchema = z.object({
  user_id: z.string().uuid("Usuario inválido."),
});

export type AdminUserActionState =
  | { ok: true; message: string }
  | { ok: false; error: string }
  | undefined;

async function originFromHeaders() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

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
  const origin = await originFromHeaders();
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
