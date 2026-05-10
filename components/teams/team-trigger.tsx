"use client";

import { type MouseEvent, type ReactNode } from "react";
import { useTeamModal } from "@/components/teams/team-modal-provider";
import { cn } from "@/lib/utils";

interface TeamTriggerProps {
  /** Team code (preferred) or UUID. If null/undefined, children render as-is without becoming clickable. */
  code: string | null | undefined;
  children: ReactNode;
  className?: string;
  /** Optional pre-open hook (e.g. for the modal-inside-modal swap). If provided, runs instead of the default open(). */
  onBeforeOpen?: () => void;
}

export function TeamTrigger({
  code,
  children,
  className,
  onBeforeOpen,
}: TeamTriggerProps) {
  const { open } = useTeamModal();

  // Shared base layout — preserved whether or not the trigger is clickable,
  // so callers can rely on flex/grid classes via `className` even for TBD
  // teams (no team code yet).
  const baseClass =
    "inline-flex items-center gap-2 rounded-sm text-left";

  if (!code) {
    return (
      <span className={cn(baseClass, className)} aria-label="Equipo sin definir">
        {children}
      </span>
    );
  }

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Prevent parent click-handlers (e.g. BracketCard's match dialog) from
    // also firing.
    e.stopPropagation();
    e.preventDefault();
    if (onBeforeOpen) {
      onBeforeOpen();
      return;
    }
    open(code);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        baseClass,
        "transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        className,
      )}
      aria-label={`Ver detalle del equipo ${code}`}
    >
      {children}
    </button>
  );
}
