import { CheckCircle2, ShieldCheck, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SCORING_RULES, type ScoringRule } from "@/lib/landing-config";

const ICONS: Record<ScoringRule["iconName"], typeof Target> = {
  Target,
  Trophy,
  ShieldCheck,
  CheckCircle2,
};

export function ScoringRules() {
  return (
    <section
      id="reglas"
      className="bg-muted/30 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Reglas
          </p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Cómo se suman los puntos
          </h2>
          <p className="mt-3 text-muted-foreground">
            El acierto exacto vale por todo. Si no clavás el resultado, igual
            sumás por ganador o por diferencia de gol.
          </p>
        </header>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2">
          {SCORING_RULES.map((rule, i) => {
            const Icon = ICONS[rule.iconName];
            return (
              <li key={`${rule.title}-${i}`}>
                <Card className="h-full border-border/60">
                  <CardContent className="flex items-start gap-4 p-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold">{rule.title}</h3>
                        {rule.terminal && (
                          <Badge variant="secondary" className="text-[10px]">
                            Terminal
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {rule.example}
                      </p>
                    </div>
                    <span className="flex flex-col items-center justify-center rounded-xl bg-accent/15 px-3 py-2 text-accent-foreground">
                      <span className="text-2xl font-extrabold leading-none tabular-nums">
                        {rule.points}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                        {rule.perEach ? "pts c/u" : "pts"}
                      </span>
                    </span>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-muted-foreground">
          Si acertás el resultado exacto, sumás 5 y no se acumula con las otras
          reglas. En cualquier otro caso, el puntaje suma por cada ítem que
          aciertes.
        </p>
      </div>
    </section>
  );
}
