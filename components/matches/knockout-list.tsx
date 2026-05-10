import { Star } from "lucide-react";
import { BracketCard, type BracketCardData } from "./bracket-card";

// Match numbers fixed by the FIFA bracket seed (see knockout migration).
const FINAL_MATCH_NUMBER = 104;
const THIRD_PLACE_MATCH_NUMBER = 103;

interface KnockoutListProps {
  matches: BracketCardData[];
  variant?: "grid" | "final";
}

export function KnockoutList({ matches, variant = "grid" }: KnockoutListProps) {
  if (variant === "final") {
    const final = matches.find((m) => m.matchNumber === FINAL_MATCH_NUMBER);
    const third = matches.find(
      (m) => m.matchNumber === THIRD_PLACE_MATCH_NUMBER,
    );
    return (
      <div className="mx-auto max-w-md space-y-6">
        {final && (
          <div>
            <p className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-foreground">
              <Star className="size-3 fill-current" aria-hidden />
              Final
              <Star className="size-3 fill-current" aria-hidden />
            </p>
            <BracketCard match={final} variant="featured" />
          </div>
        )}
        {third && (
          <div>
            <p className="mb-1.5 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Tercer puesto
            </p>
            <BracketCard match={third} variant="regular" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((m) => (
        <BracketCard key={m.id} match={m} variant="regular" />
      ))}
    </div>
  );
}
