import Link from "next/link";
import { cn } from "@/lib/utils";

export const RESULT_TABS = [
  { key: "pendientes", label: "Sin cargar" },
  { key: "cargados", label: "Cargados" },
] as const;

export type ResultTabKey = (typeof RESULT_TABS)[number]["key"];

export function isResultTabKey(value: string | undefined): value is ResultTabKey {
  return RESULT_TABS.some((t) => t.key === value);
}

interface ResultsTabsProps {
  active: ResultTabKey;
  counts: Record<ResultTabKey, number>;
}

export function ResultsTabs({ active, counts }: ResultsTabsProps) {
  return (
    <nav
      role="tablist"
      aria-label="Estado de resultados"
      className="-mx-4 overflow-x-auto border-b px-4"
    >
      <div className="flex min-w-max gap-1">
        {RESULT_TABS.map((t) => {
          const isActive = t.key === active;
          const count = counts[t.key];
          return (
            <Link
              key={t.key}
              href={`/admin/results?tab=${t.key}`}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
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
