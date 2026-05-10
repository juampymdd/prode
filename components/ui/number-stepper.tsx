"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NumberStepperProps {
  name: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md";
  required?: boolean;
}

export function NumberStepper({
  name,
  defaultValue = 0,
  min = 0,
  max = 30,
  disabled,
  ariaLabel,
  size = "md",
  required,
}: NumberStepperProps) {
  const [value, setValue] = useState<number>(
    Number.isFinite(defaultValue) ? defaultValue : 0,
  );

  const dec = () => setValue((v) => Math.max(min, v - 1));
  const inc = () => setValue((v) => Math.min(max, v + 1));

  const heightCls = size === "sm" ? "h-8" : "h-10";
  const numCls =
    size === "sm" ? "w-7 text-base" : "w-9 text-lg";

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-md border bg-background shadow-xs",
        heightCls,
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={disabled || value <= min}
        aria-label={`Restar ${ariaLabel ?? "valor"}`}
        className={cn(
          "flex h-full w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none",
        )}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        aria-live="polite"
        className={cn(
          "flex h-full items-center justify-center font-bold tabular-nums",
          numCls,
        )}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={disabled || value >= max}
        aria-label={`Sumar ${ariaLabel ?? "valor"}`}
        className={cn(
          "flex h-full w-8 items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 disabled:opacity-40 disabled:pointer-events-none",
        )}
      >
        <Plus className="size-3.5" />
      </button>
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />
    </div>
  );
}
