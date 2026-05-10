"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  saveMatchResultAction,
  recalculateMatchPointsAction,
  type ResultActionState,
} from "@/actions/result-actions";
import { Button } from "@/components/ui/button";
import { NumberStepper } from "@/components/ui/number-stepper";

interface ResultFormProps {
  matchId: string;
  defaultHome?: number | null;
  defaultAway?: number | null;
  finished: boolean;
}

export function ResultForm({
  matchId,
  defaultHome,
  defaultAway,
  finished,
}: ResultFormProps) {
  const [state, formAction, isPending] = useActionState<
    ResultActionState,
    FormData
  >(saveMatchResultAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(
        state.message ??
          (state.updatedCount != null
            ? `Recalculadas ${state.updatedCount} predicciones.`
            : "Listo."),
      );
    } else toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="match_id" value={matchId} />
      <NumberStepper
        name="home_score"
        defaultValue={defaultHome ?? 0}
        ariaLabel="goles local"
        required
      />
      <span className="font-mono text-muted-foreground">-</span>
      <NumberStepper
        name="away_score"
        defaultValue={defaultAway ?? 0}
        ariaLabel="goles visitante"
        required
      />
      <Button type="submit" size="sm" disabled={isPending} className="ml-1">
        {isPending ? "Guardando..." : finished ? "Actualizar resultado" : "Cargar resultado"}
      </Button>
    </form>
  );
}

export function RecalcButton({ matchId }: { matchId: string }) {
  const [state, formAction, isPending] = useActionState<
    ResultActionState,
    FormData
  >(recalculateMatchPointsAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(
        state.message ??
          (state.updatedCount != null
            ? `Recalculadas ${state.updatedCount} predicciones.`
            : "Listo."),
      );
    } else toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="match_id" value={matchId} />
      <Button type="submit" size="sm" variant="ghost" disabled={isPending}>
        {isPending ? "Recalculando..." : "Recalcular puntos"}
      </Button>
    </form>
  );
}
