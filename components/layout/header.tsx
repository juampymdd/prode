import Link from "next/link";
import { ListChecks, ShieldCheck, Table as TableIcon, Trophy } from "lucide-react";
import { getUserWithProfile } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { UserMenu } from "@/components/layout/user-menu";

const NAV_LINKS = [
  { href: "/partidos", label: "Partidos", icon: ListChecks },
  { href: "/standings", label: "Tablas", icon: TableIcon },
  { href: "/ranking", label: "Ranking", icon: Trophy },
] as const;

export async function Header() {
  const { user, profile } = await getUserWithProfile();
  const isAdmin = profile?.is_app_admin === true;

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center"
          aria-label="Prode 26 — dashboard"
        >
          <BrandLogo priority />
        </Link>

        {user && (
          <nav className="flex items-center gap-2">
            <div className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <Button asChild key={l.href} variant="ghost" size="sm">
                    <Link href={l.href}>
                      <Icon className="size-4" aria-hidden />
                      {l.label}
                    </Link>
                  </Button>
                );
              })}
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin/users">
                    <ShieldCheck className="size-4" aria-hidden />
                    Admin
                  </Link>
                </Button>
              )}
            </div>

            <UserMenu
              name={profile?.name ?? null}
              email={user.email ?? null}
              isAdmin={isAdmin}
            />
          </nav>
        )}
      </div>
    </header>
  );
}
