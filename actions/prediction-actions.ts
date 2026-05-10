"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { upsertPredictionSchema } from "@/lib/validations/prediction-schema";

export type PredictionActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string }
  | undefined;

export async function upsertPredictionAction(
  _prev: PredictionActionState,
  formData: FormData,
): Promise<PredictionActionState> {
  const user = await requireUser();

  const parsed = upsertPredictionSchema.safeParse({
    match_id: formData.get("match_id"),
    home_score: formData.get("home_score"),
    away_score: formData.get("away_score"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("disabled_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.disabled_at) {
    return {
      ok: false,
      error: "Tu cuenta está deshabilitada. No podés cargar pronósticos.",
    };
  }

  const { data: match, error: mErr } = await supabase
    .from("matches")
    .select("id, starts_at, status, home_team_id, away_team_id")
    .eq("id", parsed.data.match_id)
    .maybeSingle();

  if (mErr || !match) {
    return { ok: false, error: "Partido no encontrado." };
  }

  if (!match.home_team_id || !match.away_team_id) {
    return {
      ok: false,
      error: "Todavía no se conocen los rivales de este partido.",
    };
  }
  if (match.status !== "scheduled") {
    return { ok: false, error: "El partido ya está bloqueado." };
  }
  if (new Date(match.starts_at).getTime() <= Date.now()) {
    return { ok: false, error: "El partido ya empezó. La predicción está cerrada." };
  }

  const { error } = await supabase
    .from("predictions")
    .upsert(
      {
        match_id: parsed.data.match_id,
        user_id: user.id,
        home_score: parsed.data.home_score,
        away_score: parsed.data.away_score,
        points: 0,
        exact_hit: false,
        winner_hit: false,
      },
      { onConflict: "match_id,user_id" },
    );

  if (error) {
    const msg = error.message ?? "";
    if (msg.includes("MATCH_STARTED")) {
      return { ok: false, error: "El partido ya empezó. La predicción está cerrada." };
    }
    if (msg.includes("MATCH_LOCKED")) {
      return { ok: false, error: "El partido está bloqueado." };
    }
    return { ok: false, error: "No pudimos guardar tu predicción." };
  }

  revalidatePath("/partidos");
  revalidatePath("/dashboard");
  revalidatePath("/ranking");
  return { ok: true, message: "Predicción guardada." };
}
