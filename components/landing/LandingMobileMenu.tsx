"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing-config";
import { cn } from "@/lib/utils";

interface LandingMobileMenuProps {
  isLoggedIn: boolean;
}

export function LandingMobileMenu({ isLoggedIn }: LandingMobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden",
          open ? "flex" : "hidden",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        <div className="flex w-full flex-col p-6">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base font-semibold text-foreground hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6">
            <Button asChild size="lg" className="w-full">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={() => setOpen(false)}
              >
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
        </div>
      </div>
    </>
  );
}
