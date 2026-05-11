import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HypeCountdown } from "@/components/matches/hype-countdown";
import { HeroBackground } from "@/components/landing/HeroBackground";
import { MUNDIAL_KICKOFF_ISO } from "@/lib/landing-config";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18) 0, transparent 35%), radial-gradient(circle at 80% 70%, rgba(251,191,36,0.18) 0, transparent 40%)",
        }}
      />

      <HeroBackground />

      {/* Scrim radial: apaga el WebGL solo detrás del texto para asegurar legibilidad */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 42%, rgba(10,15,40,0.55) 0%, rgba(10,15,40,0.30) 45%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-16 text-center md:py-20">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] [text-shadow:0_1px_4px_rgba(10,15,40,0.5)]">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Mundial 2026
        </p>
        <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight [text-shadow:0_2px_12px_rgba(10,15,40,0.55)] sm:text-5xl md:text-6xl lg:text-7xl">
          El prode del{" "}
          <span className="relative inline-block">
            Mundial 2026
            <span
              aria-hidden
              className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-accent/80 sm:h-1.5"
            />
          </span>
        </h1>
        <p className="mt-6 max-w-xl text-balance text-lg text-white/95 [text-shadow:0_1px_6px_rgba(10,15,40,0.7)] sm:text-xl">
          Pronosticá los partidos, sumá puntos y peleá el podio. Por la gloria,
          nada más.
        </p>

        <div className="mt-10 w-full max-w-2xl rounded-2xl border border-white/15 bg-white/5 p-5 shadow-xl backdrop-blur sm:p-6">
          <HypeCountdown
            startsAt={MUNDIAL_KICKOFF_ISO}
            label="El Mundial arranca en"
          />
        </div>

        <div className="mt-10 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90"
          >
            <Link href="/signup" className="font-extrabold">
              Sumarme al prode
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/40 bg-white/5 text-primary-foreground backdrop-blur hover:bg-white/15 hover:text-primary-foreground"
          >
            <Link href="#como-funciona">
              Cómo funciona
              <ChevronDown className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
