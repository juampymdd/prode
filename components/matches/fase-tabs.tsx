import Link from "next/link";
import { cn } from "@/lib/utils";

export const FASES = [
  { key: "grupos", label: "Grupos" },
  { key: "32avos", label: "32avos" },
  { key: "octavos", label: "Octavos" },
  { key: "cuartos", label: "Cuartos" },
  { key: "semis", label: "Semis" },
  { key: "final", label: "Final" },
] as const;

export type FaseKey = (typeof FASES)[number]["key"];

export function isFaseKey(value: string | undefined): value is FaseKey {
  return FASES.some((f) => f.key === value);
}

interface FaseTabsProps {
  active: FaseKey;
  counts?: Partial<Record<FaseKey, { done: number; total: number }>>;
}

export function FaseTabs({ active, counts }: FaseTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Fases del torneo"
      className="-mx-4 overflow-x-auto border-b px-4"
    >
      <div className="flex min-w-max gap-1">
        {FASES.map((f) => {
          const isActive = f.key === active;
          const count = counts?.[f.key];
          return (
            <Link
              key={f.key}
              href={`/partidos?fase=${f.key}`}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
              {count && count.total > 0 && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                    count.done === count.total
                      ? "bg-success/15 text-success"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {count.done}/{count.total}
                </span>
              )}
              {isActive && (
                <span
                  aria-hidden
                  className="absolute inset-x-1 -bottom-px h-0.5 rounded-t bg-primary"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
