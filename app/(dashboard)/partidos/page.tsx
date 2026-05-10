import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { GroupsAccordion } from "@/components/matches/group-accordion";
import type { MatchRowProps } from "@/components/matches/match-row";
import { computeGroupStats } from "@/lib/matches/group-stats";
import { EmptyState } from "@/components/layout/empty-state";
import {
  FaseTabs,
  type FaseKey,
  isFaseKey,
} from "@/components/matches/fase-tabs";
import { KnockoutList } from "@/components/matches/knockout-list";
import type { BracketCardData } from "@/components/matches/bracket-card";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

interface MatchDbRow {
  id: string;
  match_number: number | null;
  starts_at: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  stage: string | null;
  group_name: string | null;
  home_label: string | null;
  away_label: string | null;
  home: { name: string; code: string | null; flag_url: string | null } | null;
  away: { name: string; code: string | null; flag_url: string | null } | null;
}

interface PredictionDbRow {
  match_id: string;
  home_score: number;
  away_score: number;
  points: number;
  exact_hit: boolean;
  winner_hit: boolean;
}

// DB stage → tab key. Group-stage rows have stage=null/group_name set.
const STAGE_TO_FASE: Record<string, FaseKey> = {
  "Round of 32": "32avos",
  "Round of 16": "octavos",
  "Quarter-final": "cuartos",
  "Semi-final": "semis",
  Final: "final",
  "Match for third place": "final",
};

function faseOf(m: { group_name: string | null; stage: string | null }):
  | FaseKey
  | undefined {
  if (m.group_name) return "grupos";
  return m.stage ? STAGE_TO_FASE[m.stage] : undefined;
}

export default async function PartidosPage({
  searchParams,
}: {
  searchParams: Promise<{ fase?: string }>;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const sp = await searchParams;
  const fase: FaseKey = isFaseKey(sp.fase) ? sp.fase : "grupos";

  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, match_number, starts_at, status, home_score, away_score, stage, group_name, home_label, away_label, home:teams!matches_home_team_id_fkey(name, code, flag_url), away:teams!matches_away_team_id_fkey(name, code, flag_url)",
      )
      .order("starts_at", { ascending: true }),
    supabase
      .from("predictions")
      .select("match_id, home_score, away_score, points, exact_hit, winner_hit")
      .eq("user_id", user.id),
  ]);

  const matchRows = (matches ?? []) as unknown as MatchDbRow[];
  const predictionMap = new Map<string, PredictionDbRow>();
  for (const p of (predictions ?? []) as PredictionDbRow[]) {
    predictionMap.set(p.match_id, p);
  }

  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  // Counts per fase for the tab badges.
  const counts: Partial<Record<FaseKey, { done: number; total: number }>> = {};
  for (const m of matchRows) {
    const key = faseOf(m);
    if (!key) continue;
    const c = counts[key] ?? { done: 0, total: 0 };
    c.total++;
    if (predictionMap.has(m.id) || m.status === "finished") c.done++;
    counts[key] = c;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Partidos</h1>
        <p className="text-muted-foreground">
          Cargá tu predicción antes del kick-off. Cambiá de fase desde las
          pestañas.
        </p>
      </header>

      <FaseTabs active={fase} counts={counts} />

      {fase === "grupos" ? (
        <GruposSection
          matchRows={matchRows}
          predictions={(predictions ?? []) as PredictionDbRow[]}
          predictionMap={predictionMap}
          now={now}
        />
      ) : (
        <EliminatoriaSection
          fase={fase}
          matchRows={matchRows}
          predictionMap={predictionMap}
          now={now}
        />
      )}
    </div>
  );
}

function GruposSection({
  matchRows,
  predictions,
  predictionMap,
  now,
}: {
  matchRows: MatchDbRow[];
  predictions: PredictionDbRow[];
  predictionMap: Map<string, PredictionDbRow>;
  now: number;
}) {
  const byGroup = new Map<string, MatchDbRow[]>();
  for (const m of matchRows) {
    if (!m.group_name) continue;
    const list = byGroup.get(m.group_name) ?? [];
    list.push(m);
    byGroup.set(m.group_name, list);
  }

  function buildRow(m: MatchDbRow): MatchRowProps {
    const prediction = predictionMap.get(m.id) ?? null;
    const startsAtMs = new Date(m.starts_at).getTime();
    const closedOnServer = m.status !== "scheduled" || startsAtMs <= now;
    return {
      matchId: m.id,
      startsAt: m.starts_at,
      status: m.status,
      homeName: m.home?.name ?? "TBD",
      homeCode: m.home?.code ?? null,
      homeFlagUrl: m.home?.flag_url ?? null,
      awayName: m.away?.name ?? "TBD",
      awayCode: m.away?.code ?? null,
      awayFlagUrl: m.away?.flag_url ?? null,
      homeScore: m.home_score,
      awayScore: m.away_score,
      prediction: prediction
        ? {
            homeScore: prediction.home_score,
            awayScore: prediction.away_score,
            points: prediction.points,
            exactHit: prediction.exact_hit,
            winnerHit: prediction.winner_hit,
          }
        : null,
      closedOnServer,
    };
  }

  const groupBlocks = Array.from(byGroup.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, matchesInGroup]) => {
      const seen = new Set<string>();
      const teams: { name: string; flagUrl: string | null }[] = [];
      for (const m of matchesInGroup) {
        for (const t of [m.home, m.away]) {
          if (!t) continue;
          if (seen.has(t.name)) continue;
          seen.add(t.name);
          teams.push({ name: t.name, flagUrl: t.flag_url });
        }
      }
      const stats = computeGroupStats(matchesInGroup, predictions);
      return {
        groupName,
        teams,
        stats,
        matches: matchesInGroup.map(buildRow),
      };
    });

  if (groupBlocks.length === 0) {
    return (
      <EmptyState
        title="Sin partidos cargados"
        description="Cuando carguemos el fixture, los vas a ver acá."
      />
    );
  }

  // Open the first group that still has matches to predict.
  const firstActive = groupBlocks.find(
    (g) => g.stats.finishedMatches < g.stats.totalMatches,
  );
  const defaultOpen = firstActive ? [firstActive.groupName] : [];

  return <GroupsAccordion groups={groupBlocks} defaultOpen={defaultOpen} />;
}

function EliminatoriaSection({
  fase,
  matchRows,
  predictionMap,
  now,
}: {
  fase: Exclude<FaseKey, "grupos">;
  matchRows: MatchDbRow[];
  predictionMap: Map<string, PredictionDbRow>;
  now: number;
}) {
  const stageMatches = matchRows.filter((m) => faseOf(m) === fase);

  if (stageMatches.length === 0) {
    return (
      <EmptyState
        title="Sin partidos en esta fase"
        description="Aparecerán acá cuando se conozcan los rivales."
      />
    );
  }

  const cards: BracketCardData[] = stageMatches.map((m) => {
    const pred = predictionMap.get(m.id);
    return {
      id: m.id,
      matchNumber: m.match_number ?? 0,
      startsAt: m.starts_at,
      status: m.status,
      homeName: m.home?.name ?? null,
      homeCode: m.home?.code ?? null,
      homeFlagUrl: m.home?.flag_url ?? null,
      homeLabel: m.home_label,
      awayName: m.away?.name ?? null,
      awayCode: m.away?.code ?? null,
      awayFlagUrl: m.away?.flag_url ?? null,
      awayLabel: m.away_label,
      homeScore: m.home_score,
      awayScore: m.away_score,
      closedOnServer:
        m.status !== "scheduled" || new Date(m.starts_at).getTime() <= now,
      prediction: pred
        ? {
            homeScore: pred.home_score,
            awayScore: pred.away_score,
            points: pred.points,
            exactHit: pred.exact_hit,
            winnerHit: pred.winner_hit,
          }
        : null,
    };
  });

  return (
    <KnockoutList
      matches={cards}
      variant={fase === "final" ? "final" : "grid"}
    />
  );
}
