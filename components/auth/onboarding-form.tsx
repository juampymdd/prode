"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  completeOnboardingAction,
  type AuthState,
} from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OnboardingFormProps {
  defaultName?: string;
  defaultBirthdate?: string;
}

export function OnboardingForm({
  defaultName,
  defaultBirthdate,
}: OnboardingFormProps) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    completeOnboardingAction,
    undefined,
  );
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (state && !state.ok) toast.error(state.error);
  }, [state]);

  // Max date = today; min sensible date = 120 years ago.
  const today = new Date();
  const maxDate = today.toISOString().slice(0, 10);
  const minDate = new Date(today.getFullYear() - 120, 0, 1)
    .toISOString()
    .slice(0, 10);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nombre completo</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={defaultName ?? ""}
          placeholder="Lionel Messi"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="birthdate">Fecha de nacimiento</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          required
          min={minDate}
          max={maxDate}
          defaultValue={defaultBirthdate ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Tenés que tener al menos 13 años para usar el prode.
        </p>
      </div>

      <div className="rounded-md border bg-muted/30 p-3">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="acceptTerms"
            required
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 size-4 shrink-0 rounded border-input accent-primary"
          />
          <span className="leading-snug">
            Acepto los{" "}
            <Link
              href="/terminos"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              términos y condiciones
            </Link>{" "}
            del Prode 26.
          </span>
        </label>
      </div>

      <Button type="submit" size="lg" disabled={isPending || !accepted}>
        <Sparkles className="size-4" />
        {isPending ? "Guardando..." : "Empezar a jugar"}
      </Button>
    </form>
  );
}
