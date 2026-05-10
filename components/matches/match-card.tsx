import { Lock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { Countdown } from "@/components/matches/countdown";
import { cn } from "@/lib/utils";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface MatchCardProps {
  homeName: string;
  awayName: string;
  homeCode?: string | null;
  awayCode?: string | null;
  homeFlagUrl?: string | null;
  awayFlagUrl?: string | null;
  startsAt: string;
  status: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  stage?: string | null;
  groupName?: string | null;
  prediction?: {
    homeScore: number;
    awayScore: number;
    points: number;
    exactHit: boolean;
    winnerHit: boolean;
  } | null;
  closed?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function formatDateParts(iso: string) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    const time = d.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { date, time };
  } catch {
    return { date: iso, time: "" };
  }
}

function statusBadge(status: MatchStatus) {
  switch (status) {
    case "live":
      return (
        <Badge variant="destructive" className="animate-pulse">
          ● EN VIVO
        </Badge>
      );
    case "finished":
      return <Badge variant="success">Finalizado</Badge>;
    case "locked":
      return <Badge variant="secondary">Cerrado</Badge>;
    default:
      return <Badge variant="outline">Programado</Badge>;
  }
}

export function MatchCard({
  homeName,
  awayName,
  homeCode,
  awayCode,
  homeFlagUrl,
  awayFlagUrl,
  startsAt,
  status,
  homeScore,
  awayScore,
  stage,
  groupName,
  prediction,
  closed,
  className,
  children,
}: MatchCardProps) {
  const finished = status === "finished";
  const { date, time } = formatDateParts(startsAt);

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {/* blurred flag backdrops */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex opacity-15">
        {homeFlagUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={homeFlagUrl}
            alt=""
            aria-hidden="true"
            className="flag-blur w-1/2 object-cover"
          />
        )}
        {awayFlagUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={awayFlagUrl}
            alt=""
            aria-hidden="true"
            className="flag-blur w-1/2 object-cover"
          />
        )}
      </div>

      <header className="flex items-center justify-between gap-2 border-b bg-background/60 px-4 py-2 text-xs text-muted-foreground backdrop-blur-sm">
        <span className="flex items-center gap-1.5">
          <span className="font-medium uppercase tracking-wide text-foreground/80">
            {date}
          </span>
          <span>·</span>
          <span>{time}</span>
        </span>
        <span className="flex items-center gap-2">
          {groupName && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Grupo {groupName}
            </span>
          )}
          {stage && stage !== "Fase de grupos" && (
            <span className="text-[10px] uppercase">{stage}</span>
          )}
          {statusBadge(status)}
        </span>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-5">
        <TeamTrigger
          code={homeCode}
          className="flex flex-col items-center gap-2 text-center"
        >
          <TeamFlag url={homeFlagUrl} alt={homeName} size="xl" />
          <div>
            <p className="font-semibold leading-tight">{homeName}</p>
            {homeCode && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {homeCode}
              </p>
            )}
          </div>
        </TeamTrigger>

        <div className="flex flex-col items-center gap-1 text-center">
          {finished ? (
            <p className="text-3xl font-extrabold tabular-nums">
              {homeScore ?? "-"}
              <span className="mx-2 text-muted-foreground">-</span>
              {awayScore ?? "-"}
            </p>
          ) : status === "live" ? (
            <p className="text-sm font-extrabold uppercase tracking-widest text-destructive">
              EN VIVO
            </p>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                vs
              </p>
              <Countdown
                startsAt={startsAt}
                variant="block"
                className="text-foreground"
              />
            </>
          )}
        </div>

        <TeamTrigger
          code={awayCode}
          className="flex flex-col items-center gap-2 text-center"
        >
          <TeamFlag url={awayFlagUrl} alt={awayName} size="xl" />
          <div>
            <p className="font-semibold leading-tight">{awayName}</p>
            {awayCode && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {awayCode}
              </p>
            )}
          </div>
        </TeamTrigger>
      </div>

      {(prediction || closed || children) && (
        <footer className="space-y-2 border-t bg-background/70 px-4 py-3 backdrop-blur-sm">
          {prediction && finished ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                Tu predicción
                <span className="font-mono font-semibold text-foreground">
                  {prediction.homeScore}-{prediction.awayScore}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                {prediction.exactHit ? (
                  <Badge variant="success">
                    <Star className="size-3" /> Exacto
                  </Badge>
                ) : prediction.winnerHit ? (
                  <Badge variant="secondary">Ganador OK</Badge>
                ) : null}
                <Badge variant="outline" className="font-bold">
                  +{prediction.points} pts
                </Badge>
              </span>
            </div>
          ) : prediction && closed ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Lock className="size-3.5" />
              Predicción cerrada
              <span className="font-mono font-semibold text-foreground">
                {prediction.homeScore}-{prediction.awayScore}
              </span>
            </div>
          ) : closed ? (
            <p className="flex items-center gap-2 text-sm italic text-muted-foreground">
              <Lock className="size-3.5" />
              Predicción cerrada — no cargaste pronóstico.
            </p>
          ) : null}
          {children}
        </footer>
      )}
    </article>
  );
}
