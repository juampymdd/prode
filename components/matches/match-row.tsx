"use client";

import { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { Countdown } from "@/components/matches/countdown";
import { PredictionForm } from "@/components/matches/prediction-form";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface MatchRowProps {
  matchId: string;
  startsAt: string;
  status: MatchStatus;
  homeName: string;
  homeCode: string | null;
  homeFlagUrl: string | null;
  awayName: string;
  awayCode: string | null;
  awayFlagUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  prediction: {
    homeScore: number;
    awayScore: number;
    points: number;
    exactHit: boolean;
    winnerHit: boolean;
  } | null;
  closedOnServer: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    short: d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }),
    time: d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function MatchRow(props: MatchRowProps) {
  const {
    matchId,
    startsAt,
    status,
    homeName,
    homeCode,
    homeFlagUrl,
    awayName,
    awayCode,
    awayFlagUrl,
    homeScore,
    awayScore,
    prediction,
    closedOnServer,
  } = props;

  const finished = status === "finished";
  const live = status === "live";
  const { short, time } = formatDate(startsAt);
  const [expanded, setExpanded] = useState(false);
  const breakdownId = `breakdown-${matchId}`;

  const canShowBreakdown =
    finished &&
    !!prediction &&
    homeScore !== null &&
    awayScore !== null;

  return (
    <div className="border-b py-3 last:border-b-0">
      <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[5.5rem_1fr_auto_1fr_auto]">
        {/* Date / time */}
        <div className="text-xs text-muted-foreground sm:text-[11px]">
          <div className="font-medium uppercase tracking-wider text-foreground/80">
            {short}
          </div>
          <div className="tabular-nums">{time}</div>
          {!closedOnServer && !finished && !live && (
            <Countdown
              startsAt={startsAt}
              variant="badge"
              className="mt-1 px-1.5 text-[10px]"
              prefix=""
            />
          )}
          {live && (
            <Badge variant="destructive" className="mt-1 animate-pulse text-[9px]">
              EN VIVO
            </Badge>
          )}
        </div>

        {/* Home team */}
        <div className="flex items-center justify-end gap-2 text-right text-sm">
          <TeamTrigger
            code={homeCode}
            className="flex w-full items-center justify-end gap-2"
          >
            <span className="truncate font-medium">{homeName}</span>
            {homeCode && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {homeCode}
              </span>
            )}
            <TeamFlag url={homeFlagUrl} alt={homeName} size="md" />
          </TeamTrigger>
        </div>

        {/* Score / prediction inputs */}
        <div className="flex flex-col items-center gap-1">
          {finished ? (
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-secondary px-3 py-1 text-base font-extrabold tabular-nums">
                {homeScore ?? "-"} - {awayScore ?? "-"}
              </span>
              {prediction && (
                <PredictionResult
                  prediction={prediction}
                  expanded={expanded}
                  onToggle={() => setExpanded((v) => !v)}
                  controls={breakdownId}
                />
              )}
            </div>
          ) : closedOnServer ? (
            <div className="text-xs text-muted-foreground">
              {prediction ? (
                <span>
                  Tu pron.{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {prediction.homeScore}-{prediction.awayScore}
                  </span>
                </span>
              ) : (
                <span className="italic">No cargaste pronóstico</span>
              )}
            </div>
          ) : (
            <PredictionForm
              matchId={matchId}
              startsAt={startsAt}
              defaultHome={prediction?.homeScore}
              defaultAway={prediction?.awayScore}
              size="sm"
            />
          )}
        </div>

        {/* Away team */}
        <div className="flex items-center gap-2 text-sm">
          <TeamTrigger
            code={awayCode}
            className="flex w-full items-center gap-2"
          >
            <TeamFlag url={awayFlagUrl} alt={awayName} size="md" />
            {awayCode && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {awayCode}
              </span>
            )}
            <span className="truncate font-medium">{awayName}</span>
          </TeamTrigger>
        </div>

        {/* Stage / spacer column for sm */}
        <div className="hidden sm:block" />
      </div>

      {/* Breakdown accordion */}
      {canShowBreakdown && expanded && (
        <PredictionBreakdown
          id={breakdownId}
          prediction={prediction!}
          actualHome={homeScore!}
          actualAway={awayScore!}
        />
      )}
    </div>
  );
}

function PredictionResult({
  prediction,
  expanded,
  onToggle,
  controls,
}: {
  prediction: NonNullable<MatchRowProps["prediction"]>;
  expanded: boolean;
  onToggle: () => void;
  controls: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-[10px]">
      <span className="font-mono text-muted-foreground">
        Tu: {prediction.homeScore}-{prediction.awayScore}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={controls}
        title={expanded ? "Ocultar desglose" : "Ver de dónde salen estos puntos"}
        className={cn(
          "inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-bold transition-colors",
          "hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          prediction.exactHit
            ? "bg-success/15 text-success"
            : prediction.winnerHit
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        {prediction.exactHit && <Star className="size-2.5" />}+
        {prediction.points}
        <ChevronDown
          className={cn(
            "size-2.5 transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>
    </div>
  );
}

interface BreakdownItem {
  label: string;
  detail?: string;
  awarded: boolean;
  points: number;
}

function buildBreakdown(
  prediction: NonNullable<MatchRowProps["prediction"]>,
  actualHome: number,
  actualAway: number,
): BreakdownItem[] {
  const ph = prediction.homeScore;
  const pa = prediction.awayScore;
  const exact = ph === actualHome && pa === actualAway;

  if (exact) {
    return [
      {
        label: "Marcador exacto",
        detail: `${ph}-${pa} clavado`,
        awarded: true,
        points: 5,
      },
    ];
  }

  const winnerHit = prediction.winnerHit;
  const diffHit = ph - pa === actualHome - actualAway;

  return [
    {
      label: "Ganador correcto",
      detail: winnerHit
        ? "Acertaste quién ganó (o empate)"
        : "Erraste el ganador",
      awarded: winnerHit,
      points: 3,
    },
    {
      label: "Diferencia de gol",
      detail: `Tuya: ${ph - pa >= 0 ? "+" : ""}${ph - pa} · Real: ${
        actualHome - actualAway >= 0 ? "+" : ""
      }${actualHome - actualAway}`,
      awarded: diffHit,
      points: 2,
    },
  ];
}

function PredictionBreakdown({
  id,
  prediction,
  actualHome,
  actualAway,
}: {
  id: string;
  prediction: NonNullable<MatchRowProps["prediction"]>;
  actualHome: number;
  actualAway: number;
}) {
  const items = buildBreakdown(prediction, actualHome, actualAway);
  const total = prediction.points;

  return (
    <div
      id={id}
      className="mt-2 overflow-hidden rounded-lg border bg-muted/30 text-xs"
    >
      <div className="border-b bg-muted/40 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        De dónde salen tus {total} {total === 1 ? "punto" : "puntos"}
      </div>
      <ul className="divide-y divide-border">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-center justify-between gap-3 px-3 py-1.5"
          >
            <div className="flex min-w-0 flex-col">
              <span
                className={cn(
                  "font-medium",
                  it.awarded ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {it.label}
              </span>
              {it.detail && (
                <span className="truncate text-[11px] text-muted-foreground">
                  {it.detail}
                </span>
              )}
            </div>
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-0.5 font-bold tabular-nums",
                it.awarded
                  ? "bg-success/15 text-success"
                  : "bg-muted text-muted-foreground line-through opacity-70",
              )}
            >
              +{it.points}
            </span>
          </li>
        ))}
        <li className="flex items-center justify-between gap-3 bg-muted/40 px-3 py-1.5 font-bold">
          <span>Total</span>
          <span className="tabular-nums">+{total}</span>
        </li>
      </ul>
    </div>
  );
}
