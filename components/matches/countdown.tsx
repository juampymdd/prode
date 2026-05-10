"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  startsAt: string;
  className?: string;
  variant?: "badge" | "block";
  prefix?: string;
}

function format(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days >= 1) return { value: `${days}d ${hours}h`, parts: { days, hours, minutes, seconds } };
  if (hours >= 1) return { value: `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`, parts: { days, hours, minutes, seconds } };
  return { value: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`, parts: { days, hours, minutes, seconds } };
}

export function Countdown({
  startsAt,
  className,
  variant = "badge",
  prefix = "Falta",
}: CountdownProps) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(startsAt).getTime();
    const update = () => setDiff(target - Date.now());
    // setTimeout(0) so the very first paint happens on the next tick instead
    // of synchronously inside the effect body.
    const t = setTimeout(update, 0);
    const id = setInterval(update, 1000);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [startsAt]);

  if (diff == null) {
    return variant === "block" ? (
      <span
        suppressHydrationWarning
        className={cn(
          "inline-block h-6 w-20 animate-pulse rounded bg-muted",
          className,
        )}
      />
    ) : null;
  }

  if (diff <= 0) return null;

  const { value, parts } = format(diff);
  const urgent = diff < 60 * 60 * 1000; // < 1h
  const veryUrgent = diff < 5 * 60 * 1000; // < 5m

  if (variant === "block") {
    return (
      <div
        className={cn(
          "flex items-baseline justify-center gap-1 font-mono tabular-nums",
          className,
        )}
      >
        {parts.days >= 1 ? (
          <>
            <span className="text-2xl font-extrabold">{parts.days}</span>
            <span className="text-xs text-muted-foreground">d</span>
            <span className="ml-1 text-2xl font-extrabold">{parts.hours}</span>
            <span className="text-xs text-muted-foreground">h</span>
          </>
        ) : (
          <span
            className={cn(
              "text-2xl font-extrabold",
              urgent && "text-destructive",
              veryUrgent && "animate-pulse",
            )}
          >
            {value}
          </span>
        )}
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
        urgent
          ? "bg-destructive/15 text-destructive"
          : "bg-primary/10 text-primary",
        veryUrgent && "animate-pulse",
        className,
      )}
      suppressHydrationWarning
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          urgent ? "bg-destructive" : "bg-primary",
          veryUrgent && "animate-ping",
        )}
      />
      <span>
        {prefix} {value}
      </span>
    </span>
  );
}
