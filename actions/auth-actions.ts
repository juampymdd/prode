"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
