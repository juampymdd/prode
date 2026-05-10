import Link from "next/link";
import { Trophy, Sparkles } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import { getUserWithProfile } from "@/lib/auth/get-user";
import { initials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function Header() {
  const { user, profile } = await getUserWithProfile();
  const isAdmin = profile?.is_app_admin === true;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Trophy className="size-4" />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent" />
          </span>
          <span className="hidden sm:inline">Prode 26</span>
          <span className="sm:hidden">P26</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-2">
            <div className="hidden items-center gap-1 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/partidos">Partidos</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/standings">Tablas</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/ranking">Ranking</Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/users">Admin</Link>
                </Button>
              )}
            </div>
            {isAdmin && (
              <Badge variant="secondary" className="hidden sm:inline-flex">
                <Sparkles className="size-3" /> Admin
              </Badge>
            )}
            <Avatar className="size-9 ring-2 ring-primary/10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {initials(profile?.name ?? user.email ?? "?")}
              </AvatarFallback>
            </Avatar>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Salir
              </Button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}
