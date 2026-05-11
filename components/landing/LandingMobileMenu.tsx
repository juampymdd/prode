"use client";

import { useState } from "react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ChevronRight,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing-config";
import { cn } from "@/lib/utils";

interface LandingMobileMenuProps {
  isLoggedIn: boolean;
}

export function LandingMobileMenu({ isLoggedIn }: LandingMobileMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className="inline-flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted md:hidden"
        >
          <Menu className="size-5" aria-hidden />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-md md:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />

        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl border-t border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl md:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            "duration-300",
          )}
        >
          {/* Drag handle — visual affordance only, tap backdrop or X to close */}
          <div className="flex justify-center pt-3">
            <div
              aria-hidden
              className="h-1.5 w-12 rounded-full bg-muted-foreground/30"
            />
          </div>

          <div className="flex items-center justify-between px-5 py-3">
            <DialogPrimitive.Title className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Menú
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Cerrar menú"
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <X className="size-4" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <nav
            aria-label="Secciones"
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-2"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={close}
                className="group flex items-center justify-between gap-2 rounded-xl px-4 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted active:bg-muted/80"
              >
                <span>{l.label}</span>
                <ChevronRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>

          <div
            className="border-t bg-muted/30 px-4 pt-4"
            style={{
              paddingBottom: "max(env(safe-area-inset-bottom), 1rem)",
            }}
          >
            <Button asChild size="lg" className="w-full">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                onClick={close}
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
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
