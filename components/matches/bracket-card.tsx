"use client";

import { Star, Lock } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
import { Countdown } from "@/components/matches/countdown";
import { PredictionForm } from "@/components/matches/prediction-form";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface BracketCardData {
  id: string;
  matchNumber: number;
  startsAt: string;
  status: MatchStatus;
  homeName: string | null;
  homeCode: string | null;
  homeFlagUrl: string | null;
  homeLabel: string | null;
  awayName: string | null;
  awayCode: string | null;
  awayFlagUrl: string | null;
  awayLabel: string | null;
  homeScore: number | null;
  awayScore: number | null;
  closedOnServer: boolean;
  prediction: {
    homeScore: number;
    awayScore: number;
    points: number;
    exactHit: boolean;
    winnerHit: boolean;
  } | null;
}

interface BracketCardProps {
  match: BracketCardData | undefined;
  variant?: "compact" | "regular" | "featured";
}

function formatShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamLine({
  name,
  code,
  flagUrl,
  label,
  score,
  winner,
  small,
}: {
  name: string | null;
  code: string | null;
  flagUrl: string | null;
  label: string | null;
  score: number | null;
  winner: boolean;
  small?: boolean;
}) {
  const known = name != null;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1.5",
        small ? "text-[10px]" : "text-xs",
        winner ? "font-bold text-foreground" : "text-foreground/85",
      )}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <TeamFlag url={flagUrl} alt={name ?? "TBD"} size="sm" />
        <span
          className={cn(
            "truncate",
            !known && "italic text-muted-foreground",
          )}
        >
          {known ? (code ?? name) : (label ?? "TBD")}
        </span>
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-px font-extrabold tabular-nums",
          score != null ? "bg-secondary text-secondary-foreground" : "text-muted-foreground/60",
        )}
      >
        {score ?? "—"}
      </span>
    </div>
  );
}

export function BracketCard({ match, variant = "compact" }: BracketCardProps) {
  if (!match) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/40 p-2 text-center text-[10px] italic text-muted-foreground">
        TBD
      </div>
    );
  }

  const finished = match.status === "finished";
  const live = match.status === "live";
  const teamsKnown = match.homeName != null && match.awayName != null;
  const canBet = !match.closedOnServer && teamsKnown;

  const homeWinner =
    finished &&
    match.homeScore != null &&
    match.awayScore != null &&
    match.homeScore > match.awayScore;
  const awayWinner =
    finished &&
    match.homeScore != null &&
    match.awayScore != null &&
    match.awayScore > match.homeScore;

  const small = variant === "compact";
  const padding =
    variant === "featured" ? "p-3" : variant === "regular" ? "p-2.5" : "p-1.5";

  const cardInner = (
    <>
      <header
        className={cn(
          "flex items-center justify-between gap-1 text-[9px] uppercase tracking-wider text-muted-foreground",
          variant === "featured" && "text-[10px]",
        )}
      >
        <span className="font-bold">#{match.matchNumber}</span>
        <span className="flex items-center gap-1 tabular-nums">
          {live ? (
            <Badge variant="destructive" className="animate-pulse text-[8px]">
              VIVO
            </Badge>
          ) : finished ? (
            <span>Final</span>
          ) : (
            <span>{formatShort(match.startsAt)}</span>
          )}
        </span>
      </header>
      <div className={cn("mt-1 space-y-0.5", variant === "featured" && "mt-1.5 space-y-1")}>
        <TeamLine
          name={match.homeName}
          code={match.homeCode}
          flagUrl={match.homeFlagUrl}
          label={match.homeLabel}
          score={finished ? match.homeScore : null}
          winner={homeWinner}
          small={small}
        />
        <TeamLine
          name={match.awayName}
          code={match.awayCode}
          flagUrl={match.awayFlagUrl}
          label={match.awayLabel}
          score={finished ? match.awayScore : null}
          winner={awayWinner}
          small={small}
        />
      </div>
      {!finished && teamsKnown && !match.closedOnServer && (
        <Countdown
          startsAt={match.startsAt}
          variant="badge"
          prefix=""
          className="mt-1 w-full justify-center text-[9px]"
        />
      )}
      {match.prediction && (
        <p
          className={cn(
            "mt-1 text-center text-[9px] font-mono tabular-nums",
            match.prediction.exactHit
              ? "text-success"
              : match.prediction.winnerHit
                ? "text-primary"
                : "text-muted-foreground",
          )}
        >
          Vos: {match.prediction.homeScore}-{match.prediction.awayScore}
          {finished && ` · +${match.prediction.points}`}
        </p>
      )}
    </>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "block w-full rounded-lg border bg-card text-left shadow-xs transition-all",
            "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            variant === "featured" &&
              "border-accent bg-gradient-to-br from-card to-accent/10 shadow-md ring-1 ring-accent/40",
            padding,
          )}
        >
          {cardInner}
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Partido #{match.matchNumber}
            {match.prediction?.exactHit && (
              <Star className="size-4 fill-success text-success" />
            )}
          </DialogTitle>
          <DialogDescription className="tabular-nums">
            {formatShort(match.startsAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border bg-muted/30 p-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <TeamFlag
                url={match.homeFlagUrl}
                alt={match.homeName ?? "TBD"}
                size="lg"
              />
              <p className="font-bold text-sm leading-tight">
                {match.homeName ?? (
                  <span className="italic text-muted-foreground">
                    {match.homeLabel ?? "TBD"}
                  </span>
                )}
              </p>
            </div>
            <div className="text-center">
              {finished ? (
                <p className="text-2xl font-extrabold tabular-nums">
                  {match.homeScore} - {match.awayScore}
                </p>
              ) : (
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  vs
                </p>
              )}
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <TeamFlag
                url={match.awayFlagUrl}
                alt={match.awayName ?? "TBD"}
                size="lg"
              />
              <p className="font-bold text-sm leading-tight">
                {match.awayName ?? (
                  <span className="italic text-muted-foreground">
                    {match.awayLabel ?? "TBD"}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {!teamsKnown ? (
          <p className="text-center text-sm italic text-muted-foreground">
            Esperando rivales — la apuesta se habilita cuando se conozcan los
            dos equipos.
          </p>
        ) : canBet ? (
          <div className="space-y-2">
            <p className="text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {match.prediction ? "Editá tu predicción" : "Cargá tu predicción"}
            </p>
            <div className="flex justify-center">
              <PredictionForm
                matchId={match.id}
                startsAt={match.startsAt}
                defaultHome={match.prediction?.homeScore}
                defaultAway={match.prediction?.awayScore}
                size="md"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Lock className="size-3.5" />
            {match.prediction
              ? `Tu predicción: ${match.prediction.homeScore}-${match.prediction.awayScore}`
              : "No cargaste pronóstico"}
          </div>
        )}

        {finished && match.prediction && (
          <div
            className={cn(
              "rounded-md border px-3 py-2 text-center text-sm",
              match.prediction.exactHit
                ? "border-success/30 bg-success/10 text-success"
                : match.prediction.winnerHit
                  ? "border-primary/30 bg-primary/5 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground",
            )}
          >
            {match.prediction.exactHit
              ? `🎯 ¡Exacto! Sumaste ${match.prediction.points} puntos.`
              : match.prediction.winnerHit
                ? `Ganador correcto · +${match.prediction.points} pts`
                : `+${match.prediction.points} puntos`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
