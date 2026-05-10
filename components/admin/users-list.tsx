"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Ban, CircleCheck, Mail, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteUserAction,
  resendInviteAction,
  setUserDisabledAction,
  type AdminUserActionState,
} from "@/actions/admin-user-actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/layout/empty-state";
import { initials } from "@/lib/utils";

export interface AdminUserRow {
  user_id: string;
  name: string | null;
  email: string | null;
  is_app_admin: boolean;
  disabled_at: string | null;
  email_confirmed_at: string | null;
  created_at: string;
}

interface UsersListProps {
  users: AdminUserRow[];
  currentUserId: string;
}

export function UsersList({ users, currentUserId }: UsersListProps) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null);
  const [pendingToggle, setPendingToggle] = useState<AdminUserRow | null>(null);
  const [pendingResend, setPendingResend] = useState<AdminUserRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });
  }, [users, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          inputMode="search"
          placeholder="Buscar por nombre o email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? "Sin resultados" : "Todavía no hay usuarios"}
          description={
            query
              ? "Probá con otra búsqueda."
              : "Mandá la primera invitación con el formulario de arriba."
          }
        />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {filtered.map((u) => {
            const isSelf = u.user_id === currentUserId;
            const isDisabled = !!u.disabled_at;
            const isPendingValidation = !u.email_confirmed_at;
            return (
              <li
                key={u.user_id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  isDisabled ? "opacity-60" : ""
                }`}
              >
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {initials(u.name ?? u.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium">
                    {u.name ?? <span className="italic text-muted-foreground">Sin nombre</span>}
                    {u.is_app_admin && (
                      <span className="rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                        Admin
                      </span>
                    )}
                    {isDisabled && (
                      <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">
                        Deshabilitado
                      </span>
                    )}
                    {isPendingValidation && !isDisabled && (
                      <span
                        className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600"
                        title="Todavía no validó su email"
                      >
                        Pendiente
                      </span>
                    )}
                    {isSelf && (
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        (vos)
                      </span>
                    )}
                  </p>
                  {u.email && (
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  )}
                </div>
                {isPendingValidation && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setPendingResend(u)}
                    disabled={!u.email}
                    title={
                      u.email
                        ? "Reenviar invitación de registro"
                        : "No tiene email asociado"
                    }
                    aria-label={`Reenviar invitación a ${u.name ?? u.email ?? "usuario"}`}
                  >
                    <Mail className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={
                    isDisabled
                      ? "text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600"
                      : "text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
                  }
                  onClick={() => setPendingToggle(u)}
                  disabled={isSelf}
                  title={
                    isSelf
                      ? "No podés deshabilitarte a vos mismo"
                      : isDisabled
                        ? "Habilitar"
                        : "Deshabilitar"
                  }
                  aria-label={`${isDisabled ? "Habilitar" : "Deshabilitar"} a ${u.name ?? u.email ?? "usuario"}`}
                >
                  {isDisabled ? (
                    <CircleCheck className="size-4" />
                  ) : (
                    <Ban className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setPendingDelete(u)}
                  disabled={isSelf}
                  title={isSelf ? "No podés eliminarte a vos mismo" : "Eliminar"}
                  aria-label={`Eliminar a ${u.name ?? u.email ?? "usuario"}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <DeleteUserDialog
        user={pendingDelete}
        onClose={() => setPendingDelete(null)}
      />
      <ToggleDisabledDialog
        user={pendingToggle}
        onClose={() => setPendingToggle(null)}
      />
      <ResendInviteDialog
        user={pendingResend}
        onClose={() => setPendingResend(null)}
      />
    </div>
  );
}

function DeleteUserDialog({
  user,
  onClose,
}: {
  user: AdminUserRow | null;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminUserActionState,
    FormData
  >(deleteUserAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onClose();
    } else {
      toast.error(state.error);
    }
  }, [state, onClose]);

  return (
    <Dialog open={user != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar usuario</DialogTitle>
          <DialogDescription>
            Vas a borrar a{" "}
            <span className="font-semibold text-foreground">
              {user?.name ?? user?.email ?? "este usuario"}
            </span>
            . Sus pronósticos se eliminan también. Esta acción no se puede
            deshacer.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="user_id" value={user?.user_id ?? ""} />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              <Trash2 className="size-4" />
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResendInviteDialog({
  user,
  onClose,
}: {
  user: AdminUserRow | null;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminUserActionState,
    FormData
  >(resendInviteAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onClose();
    } else {
      toast.error(state.error);
    }
  }, [state, onClose]);

  return (
    <Dialog open={user != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reenviar invitación de registro</DialogTitle>
          <DialogDescription>
            Vamos a mandarle un nuevo link para validar su email a{" "}
            <span className="font-semibold text-foreground">
              {user?.email ?? user?.name ?? "este usuario"}
            </span>
            . Cualquier link anterior queda invalidado.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="user_id" value={user?.user_id ?? ""} />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Mail className="size-4" />
              {isPending ? "Enviando…" : "Reenviar invitación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ToggleDisabledDialog({
  user,
  onClose,
}: {
  user: AdminUserRow | null;
  onClose: () => void;
}) {
  const [state, formAction, isPending] = useActionState<
    AdminUserActionState,
    FormData
  >(setUserDisabledAction, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      onClose();
    } else {
      toast.error(state.error);
    }
  }, [state, onClose]);

  const willDisable = user ? !user.disabled_at : false;
  const targetName = user?.name ?? user?.email ?? "este usuario";

  return (
    <Dialog open={user != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {willDisable ? "Deshabilitar usuario" : "Habilitar usuario"}
          </DialogTitle>
          <DialogDescription>
            {willDisable ? (
              <>
                <span className="font-semibold text-foreground">{targetName}</span>{" "}
                va a quedar en modo solo lectura: puede entrar y mirar, pero no
                cargar ni editar pronósticos. Sus puntos quedan ocultos del
                ranking. Podés volver a habilitarlo cuando quieras.
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{targetName}</span>{" "}
                va a poder volver a cargar pronósticos y a aparecer en el
                ranking.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <input type="hidden" name="user_id" value={user?.user_id ?? ""} />
          <input
            type="hidden"
            name="disabled"
            value={willDisable ? "true" : "false"}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant={willDisable ? "destructive" : "default"}
              disabled={isPending}
            >
              {willDisable ? (
                <Ban className="size-4" />
              ) : (
                <CircleCheck className="size-4" />
              )}
              {isPending
                ? willDisable
                  ? "Deshabilitando…"
                  : "Habilitando…"
                : willDisable
                  ? "Deshabilitar"
                  : "Habilitar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
