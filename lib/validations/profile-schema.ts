import { z } from "zod";

const MIN_AGE = 13;
const MAX_AGE = 120;

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Ingresá tu nombre completo (mínimo 2 caracteres).")
    .max(80, "El nombre es demasiado largo."),
  birthdate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida.")
    .refine((value) => {
      const d = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(d.getTime())) return false;
      const today = new Date();
      const age = today.getUTCFullYear() - d.getUTCFullYear();
      return age >= MIN_AGE && age <= MAX_AGE;
    }, `Tenés que tener al menos ${MIN_AGE} años.`),
  acceptTerms: z
    .union([z.literal("on"), z.literal("true"), z.boolean()])
    .transform((v) => v === true || v === "on" || v === "true")
    .refine((v) => v === true, "Tenés que aceptar los términos y condiciones."),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
