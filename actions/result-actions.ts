"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAppAdmin } from "@/lib/auth/require-user";
import {
  saveResultSchema,
  recalculateMatchSchema,
} from "@/lib/validations/result-schema";

export type ResultActionState =
  | { ok: true; message?: string; updatedCount?: number }
  | { ok: false; error: string }
  | undefined;

export async function saveMatchResultAction(
  _prev: ResultActionState,
  formData: FormData,
): Promise<ResultActionState> {
  const user = await requireAppAdmin();

  const parsed = saveResultSchema.safeParse({
    match_id: formData.get("match_id"),
    home_score: formData.get("home_score"),
    away_score: formData.get("away_score"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { error: updErr } = await supabase
    .from("matches")
    .update({
      home_score: parsed.data.home_score,
      away_score: parsed.data.away_score,
      status: "finished",
    })
    .eq("id", parsed.data.match_id);

  if (updErr) {
    return { ok: false, error: "No pudimos guardar el resultado." };
  }

  const { data: count, error: rpcErr } = await supabase.rpc(
    "recalculate_match_points",
    { p_match_id: parsed.data.match_id, p_caller_id: user.id },
  );

  if (rpcErr) {
    return {
      ok: false,
      error: "Resultado guardado, pero falló el recálculo de puntos.",
    };
  }

  revalidatePath("/admin/results");
  revalidatePath("/dashboard");
  revalidatePath("/partidos");
  revalidatePath("/ranking");
  revalidatePath("/standings");
  return {
    ok: true,
    updatedCount: (count as number) ?? 0,
    message: "Resultado guardado y puntos recalculados.",
  };
}

export async function recalculateMatchPointsAction(
  _prev: ResultActionState,
  formData: FormData,
): Promise<ResultActionState> {
  const user = await requireAppAdmin();
  const parsed = recalculateMatchSchema.safeParse({
    match_id: formData.get("match_id"),
  });
  if (!parsed.success) return { ok: false, error: "Partido inválido." };

  const supabase = await createClient();
  const { data: count, error } = await supabase.rpc("recalculate_match_points", {
    p_match_id: parsed.data.match_id,
    p_caller_id: user.id,
  });
  if (error) return { ok: false, error: "Falló el recálculo." };

  revalidatePath("/admin/results");
  revalidatePath("/ranking");
  revalidatePath("/partidos");
  return {
    ok: true,
    updatedCount: (count as number) ?? 0,
    message: "Puntos recalculados.",
  };
}
