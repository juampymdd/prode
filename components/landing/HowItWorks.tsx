import { Target, Trophy, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    icon: UserPlus,
    title: "Registrate con el link",
    body: "El organizador te comparte el link, ponés tu email y entrás al prode en 30 segundos.",
  },
  {
    icon: Target,
    title: "Cargá tus pronósticos",
    body: "Predecí los resultados desde la fase de grupos. Editá las veces que quieras hasta el kick-off de cada partido.",
  },
  {
    icon: Trophy,
    title: "Peleá el podio",
    body: "Sumá puntos partido a partido. Los tres primeros del ranking se llevan la gloria del Mundial.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-20"
    >
      <div
        aria-hidden
        className="pitch-lines pointer-events-none absolute inset-0 opacity-60"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
        <header className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-6 bg-primary/40" aria-hidden />
            Cómo funciona
            <span className="h-px w-6 bg-primary/40" aria-hidden />
          </p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Tres pasos y estás adentro
          </h2>
        </header>

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="group">
                <Card className="relative h-full overflow-hidden border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  {/* Top accent bar — appears on hover */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <CardContent className="space-y-4 p-7">
                    <div className="flex items-start justify-between">
                      <span
                        aria-label={`Paso ${i + 1}`}
                        className="bg-gradient-to-br from-primary/30 to-primary/5 bg-clip-text text-6xl font-extrabold leading-none tracking-tighter text-transparent"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Icon className="size-6" aria-hidden strokeWidth={2.4} />
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
