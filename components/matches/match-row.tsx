import { Star } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
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

  return (
    <div className="grid grid-cols-1 items-center gap-2 border-b py-3 last:border-b-0 sm:grid-cols-[5.5rem_1fr_auto_1fr_auto]">
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
        <span className="truncate font-medium">{homeName}</span>
        {homeCode && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {homeCode}
          </span>
        )}
        <TeamFlag url={homeFlagUrl} alt={homeName} size="md" />
      </div>

      {/* Score / prediction inputs */}
      <div className="flex flex-col items-center gap-1">
        {finished ? (
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-secondary px-3 py-1 text-base font-extrabold tabular-nums">
              {homeScore ?? "-"} - {awayScore ?? "-"}
            </span>
            {prediction && (
              <PredictionResult prediction={prediction} />
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
        <TeamFlag url={awayFlagUrl} alt={awayName} size="md" />
        {awayCode && (
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {awayCode}
          </span>
        )}
        <span className="truncate font-medium">{awayName}</span>
      </div>

      {/* Stage / spacer column for sm */}
      <div className="hidden sm:block" />
    </div>
  );
}

function PredictionResult({
  prediction,
}: {
  prediction: NonNullable<MatchRowProps["prediction"]>;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-[10px]">
      <span className="font-mono text-muted-foreground">
        Tu: {prediction.homeScore}-{prediction.awayScore}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-bold",
          prediction.exactHit
            ? "bg-success/15 text-success"
            : prediction.winnerHit
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
        )}
      >
        {prediction.exactHit && <Star className="size-2.5" />}+
        {prediction.points}
      </span>
    </div>
  );
}
