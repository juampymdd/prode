import { CheckCircle2, ShieldCheck, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCORING_RULES, type ScoringRule } from "@/lib/landing-config";
import { cn } from "@/lib/utils";

const ICONS: Record<ScoringRule["iconName"], typeof Target> = {
  Target,
  Trophy,
  ShieldCheck,
  CheckCircle2,
};

export function ScoringRules() {
  return (
    <section id="reglas" className="relative scroll-mt-20 bg-muted/40">
      <div
        aria-hidden
        className="pitch-lines pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary/40" aria-hidden />
            Reglas
            <span className="h-px w-6 bg-primary/40" aria-hidden />
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Cómo se suman los puntos
          </h2>
          <p className="mt-4 text-balance text-muted-foreground sm:text-lg">
            El acierto exacto vale por todo. Si no clavás el resultado, igual
            sumás por ganador o por diferencia de gol.
          </p>
        </header>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {SCORING_RULES.map((rule, i) => {
            const Icon = ICONS[rule.iconName];
            const isTerminal = rule.terminal;
            return (
              <li key={`${rule.title}-${i}`} className="group">
                <Card
                  className={cn(
                    "relative h-full overflow-hidden border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
                    isTerminal && "ring-2 ring-accent/40",
                  )}
                >
                  {/* Left accent stripe — gold for terminal, primary otherwise */}
                  <div
                    aria-hidden
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      isTerminal
                        ? "bg-gradient-to-b from-accent to-accent/40"
                        : "bg-gradient-to-b from-primary to-primary/40",
                    )}
                  />
                  <CardContent className="flex items-start gap-4 p-5 pl-6">
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110",
                        isTerminal
                          ? "bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-accent/20"
                          : "bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-primary/20",
                      )}
                    >
                      <Icon className="size-6" aria-hidden strokeWidth={2.4} />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold tracking-tight sm:text-lg">
                          {rule.title}
                        </h3>
                        {isTerminal && (
                          <Badge
                            variant="secondary"
                            className="bg-accent/15 text-[10px] font-bold uppercase tracking-wider text-accent-foreground"
                          >
                            Terminal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {rule.example}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex shrink-0 flex-col items-center justify-center rounded-xl px-3.5 py-2.5 shadow-sm",
                        isTerminal
                          ? "bg-gradient-to-br from-accent/30 to-accent/10 ring-1 ring-accent/30"
                          : "bg-gradient-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20",
                      )}
                    >
                      <span
                        className={cn(
                          "text-3xl font-extrabold leading-none tabular-nums",
                          isTerminal ? "text-accent-foreground" : "text-primary",
                        )}
                      >
                        {rule.points}
                      </span>
                      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {rule.perEach ? "pts c/u" : "pts"}
                      </span>
                    </span>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted-foreground sm:text-sm">
          Si acertás el resultado exacto, sumás 5 y no se acumula con las otras
          reglas. En cualquier otro caso, el puntaje suma por cada ítem que
          aciertes.
        </p>
      </div>
    </section>
  );
}
