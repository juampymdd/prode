import { z } from "zod";

const score = z.coerce
  .number()
  .int("El marcador debe ser un número entero.")
  .min(0, "El marcador no puede ser negativo.")
  .max(30, "Marcador demasiado alto.");

export const saveResultSchema = z.object({
  match_id: z.string().uuid("Partido inválido."),
  home_score: score,
  away_score: score,
});

export const recalculateMatchSchema = z.object({
  match_id: z.string().uuid("Partido inválido."),
});

export type SaveResultInput = z.infer<typeof saveResultSchema>;
