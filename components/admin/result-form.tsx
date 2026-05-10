"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  saveMatchResultAction,
  recalculateMatchPointsAction,
  type ResultActionState,
} from "@/actions/result-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <Input
        name="home_score"
        type="number"
        min={0}
        max={30}
        step={1}
        required
        defaultValue={defaultHome ?? ""}
        className="w-16 text-center text-lg tabular-nums"
        aria-label="Goles local"
      />
      <span className="text-muted-foreground">-</span>
      <Input
        name="away_score"
        type="number"
        min={0}
        max={30}
        step={1}
        required
        defaultValue={defaultAway ?? ""}
        className="w-16 text-center text-lg tabular-nums"
        aria-label="Goles visitante"
      />
      <Button type="submit" size="sm" disabled={isPending}>
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
