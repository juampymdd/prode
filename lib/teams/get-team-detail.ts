import { createClient } from "@/lib/supabase/server";

type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface TeamMatchRow {
  id: string;
  startsAt: string;
  status: MatchStatus;
  stage: string | null;
  groupName: string | null;
  matchNumber: number | null;
  homeScore: number | null;
  awayScore: number | null;
  isHome: boolean;
  opponent: {
    name: string;
    code: string | null;
    flagUrl: string | null;
  };
  prediction: {
    homeScore: number;
    awayScore: number;
    points: number;
    exactHit: boolean;
    winnerHit: boolean;
  } | null;
}

export interface TeamDetail {
  team: {
    id: string;
    name: string;
    code: string | null;
    flagUrl: string | null;
  };
  matches: TeamMatchRow[];
}

interface TeamRow {
  id: string;
  name: string;
  code: string | null;
  flag_url: string | null;
}

interface MatchDbRow {
  id: string;
  starts_at: string;
  status: MatchStatus;
  stage: string | null;
  group_name: string | null;
  match_number: number | null;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string | null;
  away_team_id: string | null;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getTeamDetail(slug: string): Promise<TeamDetail | null> {
  const supabase = await createClient();
  const trimmed = slug.trim();

  // Slug can be either a team `code` (e.g. ARG) or a team UUID (fallback for
  // teams without a code).
  const isUuid = UUID_REGEX.test(trimmed);
  const query = supabase.from("teams").select("id, name, code, flag_url");
  const { data: team } = await (isUuid
    ? query.eq("id", trimmed)
    : query.eq("code", trimmed.toUpperCase())
  ).maybeSingle();

  if (!team) return null;
  const t = team as TeamRow;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, starts_at, status, stage, group_name, match_number, home_score, away_score, home_team_id, away_team_id, home_label, away_label, home:teams!matches_home_team_id_fkey(name, code, flag_url), away:teams!matches_away_team_id_fkey(name, code, flag_url)",
    )
    .or(`home_team_id.eq.${t.id},away_team_id.eq.${t.id}`)
    .order("starts_at", { ascending: true });

  const matchRows = (matches ?? []) as unknown as MatchDbRow[];
  const matchIds = matchRows.map((m) => m.id);

  const predictionByMatchId = new Map<string, PredictionDbRow>();
  if (user && matchIds.length > 0) {
    const { data: predictions } = await supabase
      .from("predictions")
      .select("match_id, home_score, away_score, points, exact_hit, winner_hit")
      .eq("user_id", user.id)
      .in("match_id", matchIds);
    for (const p of (predictions ?? []) as PredictionDbRow[]) {
      predictionByMatchId.set(p.match_id, p);
    }
  }

  const teamMatches: TeamMatchRow[] = matchRows.map((m) => {
    const isHome = m.home_team_id === t.id;
    const opponentTeam = isHome ? m.away : m.home;
    const opponentLabel = isHome ? m.away_label : m.home_label;
    const pred = predictionByMatchId.get(m.id);
    return {
      id: m.id,
      startsAt: m.starts_at,
      status: m.status,
      stage: m.stage,
      groupName: m.group_name,
      matchNumber: m.match_number,
      homeScore: m.home_score,
      awayScore: m.away_score,
      isHome,
      opponent: {
        name: opponentTeam?.name ?? opponentLabel ?? "TBD",
        code: opponentTeam?.code ?? null,
        flagUrl: opponentTeam?.flag_url ?? null,
      },
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

  return {
    team: {
      id: t.id,
      name: t.name,
      code: t.code,
      flagUrl: t.flag_url,
    },
    matches: teamMatches,
  };
}
