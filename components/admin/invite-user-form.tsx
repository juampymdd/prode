"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import {
  inviteUserByMagicLinkAction,
  type AdminUserActionState,
} from "@/actions/admin-user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteUserForm() {
  const [state, formAction, isPending] = useActionState<
    AdminUserActionState,
    FormData
  >(inviteUserByMagicLinkAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <div className="grid gap-2">
        <Label htmlFor="invite-email">Email del invitado</Label>
        <Input
          id="invite-email"
          name="email"
          type="email"
          required
          inputMode="email"
          placeholder="amigo@email.com"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        <Send className="size-4" />
        {isPending ? "Enviando..." : "Mandar magic link"}
      </Button>
    </form>
  );
}
