"use client";

import { LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

export function UserMenu({ name, email, isAdmin }: UserMenuProps) {
  const displayName = name?.trim() || email?.split("@")[0] || "Sin nombre";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full ring-2 ring-primary/10 transition hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-primary"
          aria-label="Abrir menú de usuario"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials(name ?? email ?? "?")}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {initials(name ?? email ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
              <UserIcon className="size-3.5 shrink-0 text-muted-foreground" />
              {displayName}
            </p>
            {email && (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            )}
          </div>
        </div>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-accent-foreground">
                <ShieldCheck className="size-3" />
                Administrador
              </span>
            </div>
          </>
        )}

        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem asChild>
            <button
              type="submit"
              className="w-full cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="size-4" />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
