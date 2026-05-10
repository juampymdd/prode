import Link from "next/link";
import { LayoutDashboard, LogIn } from "lucide-react";
import { getUser } from "@/lib/auth/get-user";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/brand-logo";
import { NAV_LINKS } from "@/lib/landing-config";
import { LandingMobileMenu } from "./LandingMobileMenu";

export async function LandingNavbar() {
  const user = await getUser();
  const isLoggedIn = !!user;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-4 px-4">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Prode 26 — inicio"
        >
          <BrandLogo priority />
        </Link>

        <nav
          className="ml-6 hidden items-center gap-1 md:flex"
          aria-label="Secciones"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden md:block">
          <Button asChild>
            <Link href={isLoggedIn ? "/dashboard" : "/login"}>
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="size-4" aria-hidden />
                  Ir al dashboard
                </>
              ) : (
                <>
                  <LogIn className="size-4" aria-hidden />
                  Iniciar sesión
                </>
              )}
            </Link>
          </Button>
        </div>

        <div className="ml-auto md:hidden">
          <LandingMobileMenu isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </header>
  );
}
