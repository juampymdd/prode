"use client";

import { useState, useTransition } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveSignupRequestAction,
  rejectSignupRequestAction,
  deleteSignupRequestAction,
} from "@/actions/signup-admin-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApproveButtonProps {
  id: string;
  email: string;
}

export function ApproveButton({ id, email }: ApproveButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const data = new FormData();
      data.set("id", id);
      const result = await approveSignupRequestAction(undefined, data);
      if (result?.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result?.error ?? "No pudimos aprobar la solicitud.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="success">
          <Check className="size-3.5" aria-hidden />
          Aprobar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aprobar solicitud</DialogTitle>
          <DialogDescription>
            Se va a crear la cuenta y mandar el magic link a{" "}
            <span className="font-mono font-semibold text-foreground">
              {email}
            </span>
            . ¿Confirmás?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="success"
            onClick={onConfirm}
            disabled={isPending}
          >
            <Check className="size-4" aria-hidden />
            {isPending ? "Aprobando..." : "Aprobar y enviar link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RejectButtonProps {
  id: string;
}

export function RejectButton({ id }: RejectButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAction = (formData: FormData) => {
    startTransition(async () => {
      formData.set("id", id);
      const result = await rejectSignupRequestAction(undefined, formData);
      if (result?.ok) {
        toast.success(result.message);
        setOpen(false);
        setReason("");
      } else {
        toast.error(result?.error ?? "No pudimos rechazar la solicitud.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <X className="size-3.5" aria-hidden />
          Rechazar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rechazar solicitud</DialogTitle>
          <DialogDescription>
            La solicitud queda bloqueada y la persona no puede volver a
            registrarse con ese mail hasta que la elimines.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="reason">Motivo (opcional)</Label>
            <Input
              id="reason"
              name="reason"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Sólo para registro interno"
              maxLength={280}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              El motivo no se le manda al solicitante. Queda guardado para que
              recuerdes por qué lo rechazaste.
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              <X className="size-4" aria-hidden />
              {isPending ? "Rechazando..." : "Rechazar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteButtonProps {
  id: string;
  email: string;
}

export function DeleteButton({ id, email }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    startTransition(async () => {
      const data = new FormData();
      data.set("id", id);
      const result = await deleteSignupRequestAction(undefined, data);
      if (result?.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result?.error ?? "No pudimos eliminar la solicitud.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" aria-hidden />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar solicitud</DialogTitle>
          <DialogDescription>
            Esto borra la solicitud de{" "}
            <span className="font-mono font-semibold text-foreground">
              {email}
            </span>
            . El mail queda libre y la persona puede pedir acceso de nuevo.
            ¿Seguro?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            <Trash2 className="size-4" aria-hidden />
            {isPending ? "Eliminando..." : "Eliminar definitivamente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
