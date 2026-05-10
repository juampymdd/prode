"use client";

import { Lock, Radio, Star, Target } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { HypeCountdown } from "@/components/matches/hype-countdown";
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

function CardFooterStatus({
  status,
  startsAt,
  closedOnServer,
}: {
  status: MatchStatus;
  startsAt: string;
  closedOnServer: boolean;
}) {
  if (status === "finished") return null;

  if (status === "live") {
    return (
      <div className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-destructive/10 py-1 text-destructive">
        <Radio className="size-3 animate-pulse" aria-hidden />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.25em]">
          En vivo
        </span>
      </div>
    );
  }

  // Status is `scheduled` or `locked` and not yet started, or `locked` past
  // kickoff (waiting for result load). The closedOnServer flag is the
  // canonical "predictions are closed" signal and also covers "match has
  // started" (starts_at <= now).
  if (closedOnServer) {
    return (
      <p className="mt-2 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Esperando resultado
      </p>
    );
  }

  return (
    <div className="mt-2 rounded-md border bg-muted/30 p-1.5">
      <HypeCountdown startsAt={startsAt} size="compact" label="Faltan" />
    </div>
  );
}

function DialogTeamRow({
  name,
  code,
  flagUrl,
  label,
  score,
  isWinner,
}: {
  name: string | null;
  code: string | null;
  flagUrl: string | null;
  label: string | null;
  score: number | null;
  isWinner: boolean;
}) {
  const known = name != null;
  return (
    <TeamTrigger
      code={code}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        isWinner && "bg-success/8",
      )}
    >
      <TeamFlag url={flagUrl} alt={name ?? label ?? "TBD"} size="lg" />
      <span className="min-w-0 flex-1">
        {known ? (
          <span
            className={cn(
              "block truncate font-bold leading-tight",
              isWinner ? "text-success" : "text-foreground",
            )}
          >
            {name}
          </span>
        ) : (
          <span className="block truncate text-sm italic font-medium text-muted-foreground">
            {label ?? "TBD"}
          </span>
        )}
        {code && (
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {code}
          </span>
        )}
      </span>
      {score != null && (
        <span
          className={cn(
            "rounded-md px-3 py-1 text-2xl font-extrabold tabular-nums",
            isWinner
              ? "bg-success/15 text-success"
              : "bg-muted text-foreground/70",
          )}
        >
          {score}
        </span>
      )}
    </TeamTrigger>
  );
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
        "relative flex items-center justify-between gap-1.5 rounded-md py-0.5 pl-1.5 pr-1 transition-colors",
        small ? "text-[10px]" : "text-xs",
        winner && "bg-success/10",
        !known && "opacity-80",
      )}
    >
      {/* Winner accent stripe on the left */}
      {winner && (
        <span
          aria-hidden
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-success"
        />
      )}

      <span className="flex min-w-0 items-center gap-1.5">
        <TeamFlag url={flagUrl} alt={name ?? "TBD"} size="sm" />
        {known ? (
          <span
            className={cn(
              "truncate",
              winner
                ? "font-extrabold text-success"
                : "font-semibold text-foreground/90",
            )}
          >
            {code ?? name}
          </span>
        ) : (
          <span className="truncate text-[10px] font-medium uppercase tracking-wider italic text-muted-foreground/70">
            {label ?? "TBD"}
          </span>
        )}
      </span>

      <span
        className={cn(
          "shrink-0 rounded font-extrabold tabular-nums",
          small ? "px-1.5 text-[11px]" : "px-2 py-0.5 text-sm",
          score != null
            ? winner
              ? "bg-success/20 text-success"
              : "bg-secondary text-secondary-foreground"
            : "text-muted-foreground/40",
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
      <CardFooterStatus
        status={match.status}
        startsAt={match.startsAt}
        closedOnServer={match.closedOnServer}
      />
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

        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <DialogTeamRow
            name={match.homeName}
            code={match.homeCode}
            flagUrl={match.homeFlagUrl}
            label={match.homeLabel}
            score={finished ? match.homeScore : null}
            isWinner={homeWinner}
          />

          <div className="relative flex items-center justify-center bg-muted/40 py-2">
            <span aria-hidden className="absolute inset-x-6 top-1/2 h-px bg-border" />
            {finished ? (
              <span className="relative rounded-full border bg-background px-4 py-1 text-base font-extrabold tabular-nums shadow-sm">
                {match.homeScore} <span className="text-muted-foreground">-</span>{" "}
                {match.awayScore}
              </span>
            ) : (
              <span className="relative rounded-full border bg-background px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground shadow-sm">
                vs
              </span>
            )}
          </div>

          <DialogTeamRow
            name={match.awayName}
            code={match.awayCode}
            flagUrl={match.awayFlagUrl}
            label={match.awayLabel}
            score={finished ? match.awayScore : null}
            isWinner={awayWinner}
          />
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
            {match.prediction.exactHit ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Target className="size-4" aria-hidden />
                ¡Exacto! Sumaste {match.prediction.points} puntos.
              </span>
            ) : match.prediction.winnerHit
              ? `Ganador correcto · +${match.prediction.points} pts`
              : `+${match.prediction.points} puntos`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
