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
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20"
    >
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Cómo funciona
        </p>
        <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tres pasos y estás adentro
        </h2>
      </header>

      <ol className="mt-10 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <Card className="h-full border-border/60 transition-shadow hover:shadow-lg">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-start justify-between">
                    <span
                      aria-label={`Paso ${i + 1}`}
                      className="text-4xl font-extrabold text-primary/15 leading-none"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
