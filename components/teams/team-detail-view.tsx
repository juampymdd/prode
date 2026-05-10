"use client";

import { CalendarClock, History, Star } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TeamDetail, TeamMatchRow } from "@/lib/teams/get-team-detail";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fixtureLabel(m: TeamMatchRow) {
  if (m.groupName) return `Grupo ${m.groupName}`;
  if (m.stage) return m.stage;
  return null;
}

interface TeamDetailViewProps {
  detail: TeamDetail;
  /** Optional callback fired when the user clicks an opponent team (used by the modal to swap content). */
  onOpponentClick?: (slug: string) => void;
}

export function TeamDetailView({ detail, onOpponentClick }: TeamDetailViewProps) {
  const upcoming = detail.matches.filter((m) => m.status !== "finished");
  const finished = detail.matches.filter((m) => m.status === "finished");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <TeamFlag
          url={detail.team.flagUrl}
          alt={detail.team.name}
          size="xl"
        />
        <div className="min-w-0">
          <p className="text-xl font-extrabold leading-tight">
            {detail.team.name}
          </p>
          {detail.team.code && (
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {detail.team.code}
            </p>
          )}
        </div>
      </div>

      {detail.matches.length === 0 && (
        <p className="rounded-xl border border-dashed bg-muted/30 p-4 text-center text-sm italic text-muted-foreground">
          Este equipo todavía no tiene partidos en el fixture.
        </p>
      )}

      {upcoming.length > 0 && (
        <Section
          icon={<CalendarClock className="size-4 text-primary" />}
          title="Próximos"
          count={upcoming.length}
        >
          <ul className="divide-y rounded-2xl border bg-card">
            {upcoming.map((m) => (
              <MatchItem
                key={m.id}
                match={m}
                onOpponentClick={onOpponentClick}
              />
            ))}
          </ul>
        </Section>
      )}

      {finished.length > 0 && (
        <Section
          icon={<History className="size-4 text-muted-foreground" />}
          title="Jugados"
          count={finished.length}
        >
          <ul className="divide-y rounded-2xl border bg-card">
            {finished.map((m) => (
              <MatchItem
                key={m.id}
                match={m}
                onOpponentClick={onOpponentClick}
              />
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title} <span className="text-foreground">({count})</span>
      </h3>
      {children}
    </section>
  );
}

function MatchItem({
  match,
  onOpponentClick,
}: {
  match: TeamMatchRow;
  onOpponentClick?: (slug: string) => void;
}) {
  const finished = match.status === "finished";
  const live = match.status === "live";
  const teamScore = match.isHome ? match.homeScore : match.awayScore;
  const opponentScore = match.isHome ? match.awayScore : match.homeScore;

  const result = finished
    ? teamScore != null && opponentScore != null
      ? teamScore > opponentScore
        ? "win"
        : teamScore < opponentScore
          ? "loss"
          : "draw"
      : null
    : null;

  const label = fixtureLabel(match);
  const opponentSlug = match.opponent.code ?? null;

  const opponentNode = (
    <span className="flex items-center gap-2">
      <TeamFlag
        url={match.opponent.flagUrl}
        alt={match.opponent.name}
        size="sm"
      />
      <span className="truncate font-medium">{match.opponent.name}</span>
      {match.opponent.code && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {match.opponent.code}
        </span>
      )}
    </span>
  );

  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="tabular-nums">{formatDate(match.startsAt)}</span>
        <span className="flex items-center gap-1.5">
          {label && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {label}
            </span>
          )}
          {live && (
            <Badge variant="destructive" className="animate-pulse text-[10px]">
              EN VIVO
            </Badge>
          )}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {match.isHome ? "vs" : "@"}
        </span>
        {opponentSlug ? (
          <span className="flex-1 min-w-0">
            <TeamTrigger
              code={opponentSlug}
              className="text-left"
              onBeforeOpen={
                onOpponentClick ? () => onOpponentClick(opponentSlug) : undefined
              }
            >
              {opponentNode}
            </TeamTrigger>
          </span>
        ) : (
          <span className="flex-1 min-w-0">{opponentNode}</span>
        )}
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-sm font-extrabold tabular-nums",
            finished
              ? result === "win"
                ? "bg-success/15 text-success"
                : result === "loss"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-secondary text-secondary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          {finished
            ? `${teamScore ?? "-"} - ${opponentScore ?? "-"}`
            : "vs"}
        </span>
      </div>

      {match.prediction && (
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-xs",
            match.prediction.exactHit
              ? "border-success/30 bg-success/5 text-success"
              : match.prediction.winnerHit
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-border bg-muted/30 text-muted-foreground",
          )}
        >
          <span className="flex items-center gap-1.5">
            <span className="font-medium uppercase tracking-wider">
              Tu pron.
            </span>
            <span className="font-mono font-semibold">
              {match.isHome
                ? `${match.prediction.homeScore}-${match.prediction.awayScore}`
                : `${match.prediction.awayScore}-${match.prediction.homeScore}`}
            </span>
          </span>
          {finished && (
            <span className="flex items-center gap-1 font-bold">
              {match.prediction.exactHit && (
                <Star className="size-3 fill-current" />
              )}
              +{match.prediction.points}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
