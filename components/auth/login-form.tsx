"use client";

import { useActionState, useEffect, useState } from "react";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  sendMagicLinkAction,
  type AuthState,
} from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    sendMagicLinkAction,
    undefined,
  );
  const [dismissedAt, setDismissedAt] = useState<unknown>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  const showSentView = state?.ok === true && state !== dismissedAt;

  if (showSentView) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <p className="text-sm font-medium">Revisá tu email</p>
        <p className="text-xs text-muted-foreground">
          Te mandamos un link mágico. Abrílo desde el mismo dispositivo y entrás
          al prode.
        </p>
        <button
          type="button"
          onClick={() => setDismissedAt(state)}
          className="text-xs text-primary hover:underline"
        >
          Mandarlo a otro email
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <div className="grid gap-2">
        <Label htmlFor="email">Tu email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="vos@email.com"
          inputMode="email"
        />
        <p className="text-xs text-muted-foreground">
          Te mandamos un link mágico — sin contraseñas.
        </p>
      </div>
      <Button type="submit" size="lg" disabled={isPending}>
        <Sparkles className="size-4" />
        {isPending ? "Enviando link..." : "Mandarme el link"}
      </Button>
    </form>
  );
}
