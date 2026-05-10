"use client";

import { useState, useTransition } from "react";
import { Eraser } from "lucide-react";
import { toast } from "sonner";
import { clearMatchResultAction } from "@/actions/result-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ClearResultButtonProps {
  matchId: string;
  matchLabel: string;
  className?: string;
}

export function ClearResultButton({
  matchId,
  matchLabel,
  className,
}: ClearResultButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await clearMatchResultAction(undefined, formData);
      if (result?.ok) {
        toast.success(result.message ?? "Resultado borrado.");
        setOpen(false);
      } else {
        toast.error(result?.error ?? "No pudimos borrar el resultado.");
      }
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={
          className ??
          "text-destructive hover:bg-destructive/10 hover:text-destructive"
        }
        onClick={() => setOpen(true)}
      >
        <Eraser className="size-4" />
        Borrar resultado
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Borrar resultado</DialogTitle>
            <DialogDescription>
              Vas a borrar el resultado cargado de{" "}
              <span className="font-semibold text-foreground">{matchLabel}</span>
              . El partido vuelve a la lista de <strong>Pendientes</strong> y
              los puntos sumados por las predicciones se resetean a cero. Los
              pronósticos cargados por los usuarios <strong>no</strong> se
              tocan: cuando vuelvas a guardar el resultado se recalculan
              automáticamente.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAction}>
            <input type="hidden" name="match_id" value={matchId} />
            <div className="mt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                <Eraser className="size-4" />
                {isPending ? "Borrando…" : "Borrar resultado"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
