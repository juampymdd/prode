import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HypeCountdown } from "@/components/matches/hype-countdown";
import { MUNDIAL_KICKOFF_ISO } from "@/lib/landing-config";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(251,191,36,0.25) 0, transparent 40%)",
        }}
      />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center md:flex-row md:justify-between md:text-left">
        <div className="space-y-3">
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            ¿Listo para jugar?
          </h2>
          <p className="text-balance text-base opacity-90">
            Sumate ahora y empezá a cargar pronósticos antes del primer partido.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="font-semibold"
          >
            <Link href="/signup">
              Sumarme al prode
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur md:w-auto">
          <HypeCountdown
            startsAt={MUNDIAL_KICKOFF_ISO}
            label="Faltan"
          />
        </div>
      </div>
    </section>
  );
}
