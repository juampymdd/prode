"use client";

import { useCallback, useState } from "react";
import { ChevronDown, Loader2, Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamFlag } from "@/components/teams/team-flag";
import { createClient } from "@/lib/supabase/client";
import {
  fetchUserPredictions,
  type UserPredictionEntry,
} from "@/lib/ranking/get-user-predictions";
import { cn } from "@/lib/utils";

interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  isAdmin: boolean;
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
  predictionsCount: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function positionStyle(pos: number) {
  if (pos === 1) return "bg-gold/15 text-gold-foreground ring-gold/40";
  if (pos === 2) return "bg-silver/30 ring-silver/40";
  if (pos === 3) return "bg-bronze/15 ring-bronze/40";
  return "bg-muted";
}

interface FetchState {
  loading: boolean;
  data?: UserPredictionEntry[];
  error?: string;
}

export function RankingTable({
  rows,
  meUserId,
}: {
  rows: RankingEntry[];
  meUserId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, FetchState>>({});

  const ensureLoaded = useCallback(
    async (userId: string) => {
      if (cache[userId]?.data || cache[userId]?.loading) return;
      setCache((c) => ({ ...c, [userId]: { loading: true } }));
      try {
        const supabase = createClient();
        const data = await fetchUserPredictions(supabase, userId);
        setCache((c) => ({ ...c, [userId]: { loading: false, data } }));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Error desconocido";
        setCache((c) => ({ ...c, [userId]: { loading: false, error: msg } }));
      }
    },
    [cache],
  );

  const toggle = useCallback(
    (userId: string) => {
      setOpenId((cur) => {
        const next = cur === userId ? null : userId;
        if (next) void ensureLoaded(next);
        return next;
      });
    },
    [ensureLoaded],
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 pl-4">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead className="text-right">Pts</TableHead>
          <TableHead className="text-right">Exactos</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Ganadores</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Cargadas</TableHead>
          <TableHead className="w-10 pr-4 text-right" aria-label="Detalle" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => {
          const isMe = !!meUserId && r.userId === meUserId;
          const isOpen = openId === r.userId;
          const state = cache[r.userId];
          return (
            <RankingTableEntry
              key={r.userId}
              entry={r}
              isMe={isMe}
              isOpen={isOpen}
              state={state}
              onToggle={() => toggle(r.userId)}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}

function RankingTableEntry({
  entry,
  isMe,
  isOpen,
  state,
  onToggle,
}: {
  entry: RankingEntry;
  isMe: boolean;
  isOpen: boolean;
  state: FetchState | undefined;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow
        onClick={onToggle}
        aria-expanded={isOpen}
        className={cn(
          "cursor-pointer transition-colors",
          isMe ? "bg-primary/8 hover:bg-primary/12" : "hover:bg-muted/40",
          isOpen && (isMe ? "bg-primary/12" : "bg-muted/40"),
        )}
      >
        <TableCell className="pl-4">
          <span
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset",
              positionStyle(entry.position),
            )}
          >
            {entry.position}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                {initials(entry.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{entry.name}</span>
            {entry.isAdmin && (
              <span className="rounded bg-accent/40 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                Admin
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right font-bold tabular-nums">
          {entry.totalPoints}
        </TableCell>
        <TableCell className="text-right tabular-nums">
          {entry.exactHits}
        </TableCell>
        <TableCell className="hidden text-right tabular-nums sm:table-cell">
          {entry.winnerHits}
        </TableCell>
        <TableCell className="hidden text-right tabular-nums sm:table-cell">
          {entry.predictionsCount}
        </TableCell>
        <TableCell className="pr-4 text-right">
          <ChevronDown
            className={cn(
              "ml-auto size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180 text-foreground",
            )}
            aria-hidden
          />
        </TableCell>
      </TableRow>
      {isOpen && (
        <TableRow
          className={cn("bg-muted/20 hover:bg-muted/20", isMe && "bg-primary/5")}
        >
          <TableCell colSpan={7} className="p-0">
            <ExpandedPanel name={entry.name} state={state} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ExpandedPanel({
  name,
  state,
}: {
  name: string;
  state: FetchState | undefined;
}) {
  if (!state || state.loading) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando pronósticos…
      </div>
    );
  }
  if (state.error) {
    return (
      <div className="px-4 py-6 text-sm text-destructive">
        No pudimos traer los pronósticos: {state.error}
      </div>
    );
  }
  const data = state.data ?? [];
  if (data.length === 0) {
    return (
      <div className="px-4 py-6 text-sm italic text-muted-foreground">
        {name} todavía no cargó ningún pronóstico.
      </div>
    );
  }

  const finished = data.filter((d) => d.status === "finished");
  const upcoming = data.filter((d) => d.status !== "finished");

  return (
    <div className="space-y-3 px-3 py-4 sm:px-6">
      {finished.length > 0 && (
        <PredictionList title="Jugados" items={finished} />
      )}
      {upcoming.length > 0 && (
        <PredictionList title="Pendientes" items={upcoming} muted />
      )}
    </div>
  );
}

function PredictionList({
  title,
  items,
  muted,
}: {
  title: string;
  items: UserPredictionEntry[];
  muted?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="font-bold">{title}</span>
        <span className="tabular-nums">{items.length}</span>
      </div>
      <ul className="divide-y divide-border">
        {items.map((p) => (
          <PredictionItem key={p.matchId} pred={p} muted={muted} />
        ))}
      </ul>
    </div>
  );
}

function formatShortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
}

function statusLabel(s: UserPredictionEntry["status"]) {
  switch (s) {
    case "finished":
      return "Final";
    case "live":
      return "En vivo";
    case "locked":
      return "Cerrado";
    default:
      return null;
  }
}

function PredictionItem({
  pred,
  muted,
}: {
  pred: UserPredictionEntry;
  muted?: boolean;
}) {
  const finished = pred.status === "finished";
  const live = pred.status === "live";
  const label = statusLabel(pred.status);
  const pillClass = pred.exactHit
    ? "bg-success/15 text-success"
    : pred.winnerHit
      ? "bg-primary/10 text-primary"
      : finished
        ? "bg-muted text-muted-foreground"
        : "bg-muted/60 text-muted-foreground";

  return (
    <li className="flex items-center gap-3 px-3 py-2 text-xs">
      <div className="w-12 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {formatShortDate(pred.startsAt)}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 text-right">
        <span className="truncate font-medium">{pred.homeName}</span>
        <TeamFlag url={pred.homeFlagUrl} alt={pred.homeName} size="sm" />
      </div>

      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-extrabold tabular-nums",
            finished ? "bg-secondary" : "bg-muted text-muted-foreground",
          )}
        >
          {pred.homeScore ?? "–"}–{pred.awayScore ?? "–"}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          tu: {pred.predHome}-{pred.predAway}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <TeamFlag url={pred.awayFlagUrl} alt={pred.awayName} size="sm" />
        <span className="truncate font-medium">{pred.awayName}</span>
      </div>

      <div className="flex w-16 shrink-0 flex-col items-end gap-0.5">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1.5 py-px text-[10px] font-bold",
            pillClass,
            muted && !pred.exactHit && !pred.winnerHit && "opacity-70",
          )}
        >
          {pred.exactHit && <Star className="size-2.5" />}
          {finished ? `+${pred.points}` : "—"}
        </span>
        {label && (
          <span
            className={cn(
              "text-[9px] uppercase tracking-wider",
              live ? "font-bold text-destructive" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
        )}
      </div>
    </li>
  );
}
