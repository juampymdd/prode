"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  createSignupRequestAction,
  type SignupActionState,
} from "@/actions/signup-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<
    SignupActionState,
    FormData
  >(createSignupRequestAction, undefined);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  const today = new Date();
  const maxDate = today.toISOString().slice(0, 10);
  const minDate = new Date(today.getFullYear() - 120, 0, 1)
    .toISOString()
    .slice(0, 10);

  if (state?.ok) {
    return (
      <div className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-bold">¡Solicitud enviada!</h2>
        <p className="text-sm text-muted-foreground">{state.message}</p>
        <p className="text-sm text-muted-foreground">
          No respondas a esta página. Cuando el admin apruebe tu solicitud, te
          va a llegar un mail con un link para entrar al prode.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      {/* Honeypot: hidden from humans, irresistible to bots. Server treats
          any non-empty value as a bot submission and silently drops it. */}
      <div
        aria-hidden
        className="pointer-events-none overflow-hidden"
        style={{ position: "absolute", left: "-9999px", width: 0, height: 0 }}
      >
        <label htmlFor="hp_url">No completar este campo</label>
        <input
          id="hp_url"
          name="hp_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={120}
          placeholder="vos@ejemplo.com"
        />
      </div>

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
        <Send className="size-4" aria-hidden />
        {isPending ? "Enviando..." : "Pedir sumarme al prode"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tenés cuenta aprobada?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
