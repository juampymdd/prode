"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HypeCountdownProps {
  startsAt: string;
  className?: string;
  label?: string;
}

interface Parts {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Calendar-aware diff: months are computed by walking the calendar so
// "1 mes 3 días" stays accurate across month boundaries with 28/30/31 days.
function diffParts(target: Date, now: Date): Parts | null {
  if (target.getTime() <= now.getTime()) return null;

  let months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  const anchor = new Date(now);
  anchor.setMonth(anchor.getMonth() + months);
  if (anchor.getTime() > target.getTime()) {
    months--;
    anchor.setMonth(anchor.getMonth() - 1);
  }

  let remaining = target.getTime() - anchor.getTime();
  const days = Math.floor(remaining / 86_400_000);
  remaining -= days * 86_400_000;
  const hours = Math.floor(remaining / 3_600_000);
  remaining -= hours * 3_600_000;
  const minutes = Math.floor(remaining / 60_000);
  remaining -= minutes * 60_000;
  const seconds = Math.floor(remaining / 1000);

  return { months, days, hours, minutes, seconds };
}

const UNITS: Array<{ key: keyof Parts; label: string }> = [
  { key: "months", label: "MES" },
  { key: "days", label: "DÍA" },
  { key: "hours", label: "HRS" },
  { key: "minutes", label: "MIN" },
  { key: "seconds", label: "SEG" },
];

export function HypeCountdown({
  startsAt,
  className,
  label = "El Mundial arranca en",
}: HypeCountdownProps) {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    const target = new Date(startsAt);
    let id: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const next = diffParts(target, new Date());
      setParts((prev) => {
        // Same digits across the board → bail out so months/days/hours/minutes
        // boxes don't re-render every second once they've gone static.
        if (
          prev &&
          next &&
          prev.seconds === next.seconds &&
          prev.minutes === next.minutes &&
          prev.hours === next.hours &&
          prev.days === next.days &&
          prev.months === next.months
        ) {
          return prev;
        }
        return next;
      });
      // Past kickoff: stop the loop forever.
      if (!next && id) {
        clearInterval(id);
        id = null;
      }
    };

    tick();
    id = setInterval(tick, 1000);
    return () => {
      if (id) clearInterval(id);
    };
  }, [startsAt]);

  return (
    <div className={cn("space-y-2", className)} suppressHydrationWarning>
      <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">
        {label}
      </p>
      <div className="flex items-end justify-center gap-1 sm:gap-1.5">
        {UNITS.map((u, i) => {
          const isLast = i === UNITS.length - 1;
          const isSeconds = u.key === "seconds";
          const value = parts ? String(parts[u.key]).padStart(2, "0") : "—";
          return (
            <div key={u.key} className="flex items-end">
              <div className="flex flex-col items-center gap-1">
                <div
                  // Re-key the seconds box on every tick so the scale/opacity
                  // animation restarts and visually "ticks" each second.
                  key={isSeconds && parts ? parts.seconds : undefined}
                  className={cn(
                    "flex min-w-[2.75rem] items-center justify-center rounded-lg px-2 py-1.5 text-2xl font-extrabold tabular-nums shadow-inner ring-1 backdrop-blur-sm sm:min-w-[3.5rem] sm:text-3xl",
                    isSeconds
                      ? "bg-accent/40 text-white ring-accent/50 motion-safe:animate-[tick_700ms_ease-out]"
                      : "bg-white/15 ring-white/25",
                  )}
                >
                  {value}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-70">
                  {u.label}
                </span>
              </div>
              {!isLast && (
                <span
                  aria-hidden
                  className="px-0.5 pb-6 text-2xl font-extrabold opacity-50 sm:px-1 sm:text-3xl"
                >
                  :
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
