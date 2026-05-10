"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteUserAction,
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
  created_at: string;
}

interface UsersListProps {
  users: AdminUserRow[];
  currentUserId: string;
}

export function UsersList({ users, currentUserId }: UsersListProps) {
  const [query, setQuery] = useState("");
  const [pendingDelete, setPendingDelete] = useState<AdminUserRow | null>(null);

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
            return (
              <li key={u.user_id} className="flex items-center gap-3 px-4 py-3">
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
