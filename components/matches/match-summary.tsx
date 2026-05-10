// Compact one-line summary used inside lists where MatchCard is too heavy.
import { Badge } from "@/components/ui/badge";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { cn } from "@/lib/utils";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

interface MatchSummaryProps {
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
  className?: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusBadge(status: MatchStatus) {
  switch (status) {
    case "live":
      return <Badge variant="destructive">EN VIVO</Badge>;
    case "finished":
      return <Badge variant="success">Finalizado</Badge>;
    case "locked":
      return <Badge variant="secondary">Cerrado</Badge>;
    default:
      return <Badge variant="outline">Programado</Badge>;
  }
}

export function MatchSummary({
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
  className,
}: MatchSummaryProps) {
  const finished = status === "finished";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(startsAt)}</span>
        <div className="flex items-center gap-2">
          {groupName && <span>Grupo {groupName}</span>}
          {stage && stage !== "Fase de grupos" && <span>{stage}</span>}
          {statusBadge(status)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm font-medium">
        <span className="flex flex-1 justify-end">
          <TeamTrigger
            code={homeCode}
            className="flex items-center justify-end gap-2 text-right"
          >
            <span className="truncate">{homeName}</span>
            {homeCode && (
              <span className="text-xs text-muted-foreground">{homeCode}</span>
            )}
            <TeamFlag url={homeFlagUrl} alt={homeName} size="sm" />
          </TeamTrigger>
        </span>
        <span className="rounded-md bg-secondary px-3 py-1 text-base tabular-nums font-semibold">
          {finished ? `${homeScore ?? "-"} - ${awayScore ?? "-"}` : "vs"}
        </span>
        <span className="flex flex-1">
          <TeamTrigger
            code={awayCode}
            className="flex items-center gap-2"
          >
            <TeamFlag url={awayFlagUrl} alt={awayName} size="sm" />
            {awayCode && (
              <span className="text-xs text-muted-foreground">{awayCode}</span>
            )}
            <span className="truncate">{awayName}</span>
          </TeamTrigger>
        </span>
      </div>
    </div>
  );
}
