import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";

const LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#reglas", label: "Reglas" },
  { href: "/standings", label: "Tablas" },
  { href: "/#podio", label: "Podio" },
  { href: "/#faq", label: "FAQ" },
];

export function LandingFooter() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="Prode 26 — inicio"
            >
              <BrandLogo />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              El prode privado del Mundial 2026 — pronósticos, ranking y
              bragging rights en un solo lugar.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
              Secciones
            </p>
            <ul className="space-y-2 text-sm">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">
              Legal
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terminos"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © 2026 Prode 26 · hecho por{" "}
            <Link
              href="https://juampymad.com"
              className="font-semibold text-foreground/80 transition-colors hover:text-primary hover:underline"
            >
              juampymad.com
            </Link>
          </p>
          <p className="opacity-80">
            No afiliado a FIFA. Marcas propiedad de sus dueños.
          </p>
        </div>
      </div>
    </footer>
  );
}
