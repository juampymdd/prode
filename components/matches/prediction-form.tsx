"use client";

import { useActionState, useEffect, useState } from "react";
import { Lock, Pencil, Save } from "lucide-react";
import { toast } from "sonner";
import {
  upsertPredictionAction,
  type PredictionActionState,
} from "@/actions/prediction-actions";
import { Button } from "@/components/ui/button";
import { NumberStepper } from "@/components/ui/number-stepper";

interface PredictionFormProps {
  matchId: string;
  startsAt: string;
  defaultHome?: number;
  defaultAway?: number;
  size?: "sm" | "md";
}

export function PredictionForm({
  matchId,
  startsAt,
  defaultHome,
  defaultAway,
  size = "md",
}: PredictionFormProps) {
  const [state, formAction, isPending] = useActionState<
    PredictionActionState,
    FormData
  >(upsertPredictionAction, undefined);
  const isEdit = defaultHome != null;

  // Live tick — self-lock when kickoff passes (no refresh needed).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const update = () => setNow(Date.now());
    const t = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message ?? "Predicción guardada.");
    else toast.error(state.error);
  }, [state]);

  const kickoff = new Date(startsAt).getTime();
  const closed = now != null && now >= kickoff;

  if (closed) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3" />
        <span>
          Cerrada
          {isEdit && (
            <span className="ml-1 font-mono font-semibold text-foreground">
              {defaultHome}-{defaultAway}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="match_id" value={matchId} />
      <NumberStepper
        name="home_score"
        defaultValue={defaultHome ?? 0}
        ariaLabel="goles local"
        size={size}
        required
      />
      <span className="font-mono text-muted-foreground">-</span>
      <NumberStepper
        name="away_score"
        defaultValue={defaultAway ?? 0}
        ariaLabel="goles visitante"
        size={size}
        required
      />
      <Button
        type="submit"
        size={size === "sm" ? "sm" : "default"}
        variant={isEdit ? "secondary" : "default"}
        disabled={isPending}
        className="ml-1"
      >
        {isEdit ? (
          <Pencil className="size-3.5" />
        ) : (
          <Save className="size-3.5" />
        )}
        <span className="hidden sm:inline">
          {isPending ? "..." : isEdit ? "Actualizar" : "Guardar"}
        </span>
      </Button>
    </form>
  );
}
