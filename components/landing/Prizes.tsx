import { Award, Medal, Trophy } from "lucide-react";
import { PODIUM_POSITIONS } from "@/lib/landing-config";
import { cn } from "@/lib/utils";

const POSITION_META = {
  1: {
    icon: Trophy,
    badge: "1°",
    bg: "bg-gradient-to-b from-accent to-accent/70",
    text: "text-accent-foreground",
    iconColor: "text-accent-foreground",
    height: "h-56 md:h-64",
  },
  2: {
    icon: Medal,
    badge: "2°",
    bg: "bg-gradient-to-b from-secondary to-secondary/80",
    text: "text-secondary-foreground",
    iconColor: "text-secondary-foreground/80",
    height: "h-44 md:h-52",
  },
  3: {
    icon: Award,
    badge: "3°",
    bg: "bg-gradient-to-b from-bronze/80 to-bronze/60",
    text: "text-primary-foreground",
    iconColor: "text-primary-foreground",
    height: "h-36 md:h-44",
  },
} as const;

export function Prizes() {
  // Visual podium order: 2 - 1 - 3 (left, center, right).
  const ordered = [
    PODIUM_POSITIONS.find((p) => p.position === 2),
    PODIUM_POSITIONS.find((p) => p.position === 1),
    PODIUM_POSITIONS.find((p) => p.position === 3),
  ].filter((p): p is (typeof PODIUM_POSITIONS)[number] => !!p);

  return (
    <section
      id="podio"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20"
    >
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Podio
        </p>
        <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Por la gloria, nada más
        </h2>
        <p className="mt-3 text-muted-foreground">
          Acá no hay pozo ni premios. Lo que está en juego es el bragging right
          de quedar arriba en el ranking del Mundial.
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 items-end gap-3 sm:gap-4">
        {ordered.map((p) => {
          const meta = POSITION_META[p.position as 1 | 2 | 3];
          const Icon = meta.icon;
          return (
            <div key={p.position} className="flex flex-col items-center gap-2">
              <Icon
                className={cn(
                  "size-10 sm:size-12",
                  p.position === 1 ? "text-gold" : meta.iconColor,
                )}
                aria-hidden
              />
              <div
                className={cn(
                  "flex w-full flex-col items-center justify-end gap-1 rounded-t-2xl px-3 py-4 shadow-lg",
                  meta.bg,
                  meta.text,
                  meta.height,
                )}
                aria-label={`${meta.badge}: ${p.label}`}
              >
                <span className="text-3xl font-extrabold tabular-nums sm:text-4xl">
                  {meta.badge}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  {p.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-balance text-center text-sm text-muted-foreground sm:text-base">
        Al cierre del Mundial, los tres primeros del ranking se quedan con la
        gloria. El resto, con la próxima.
      </p>
    </section>
  );
}
