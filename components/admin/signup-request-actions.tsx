"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveSignupRequestAction,
  rejectSignupRequestAction,
  deleteSignupRequestAction,
  type SignupAdminState,
} from "@/actions/signup-admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ApproveButtonProps {
  id: string;
  email: string;
}

export function ApproveButton({ id, email }: ApproveButtonProps) {
  const [state, formAction, isPending] = useActionState<
    SignupAdminState,
    FormData
  >(approveSignupRequestAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`¿Aprobar y enviar el link a ${email}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="sm"
        variant="success"
        disabled={isPending}
      >
        <Check className="size-3.5" aria-hidden />
        {isPending ? "Aprobando..." : "Aprobar"}
      </Button>
    </form>
  );
}

interface RejectButtonProps {
  id: string;
}

export function RejectButton({ id }: RejectButtonProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState<
    SignupAdminState,
    FormData
  >(rejectSignupRequestAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      setOpen(false);
    } else toast.error(state.error);
  }, [state]);

  if (!open) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        <X className="size-3.5" aria-hidden />
        Rechazar
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Input
        name="reason"
        type="text"
        placeholder="Motivo (opcional)"
        maxLength={280}
        className="h-8 w-48 text-xs"
        autoFocus
      />
      <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
        {isPending ? "..." : "Rechazar"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        Cancelar
      </Button>
    </form>
  );
}

interface DeleteButtonProps {
  id: string;
  email: string;
}

export function DeleteButton({ id, email }: DeleteButtonProps) {
  const [state, formAction, isPending] = useActionState<
    SignupAdminState,
    FormData
  >(deleteSignupRequestAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `Eliminar la solicitud de ${email}. El email queda libre y la persona puede pedir de nuevo. ¿Seguro?`,
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        disabled={isPending}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-3.5" aria-hidden />
        {isPending ? "..." : "Eliminar"}
      </Button>
    </form>
  );
}
