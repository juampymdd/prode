import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface UserPredictionEntry {
  matchId: string;
  startsAt: string;
  status: MatchStatus;
  stage: string | null;
  groupName: string | null;
  homeName: string;
  homeCode: string | null;
  homeFlagUrl: string | null;
  awayName: string;
  awayCode: string | null;
  awayFlagUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  predHome: number;
  predAway: number;
  points: number;
  exactHit: boolean;
  winnerHit: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RawRow {
  match_id: string;
  home_score: number;
  away_score: number;
  points: number;
  exact_hit: boolean;
  winner_hit: boolean;
  created_at: string;
  updated_at: string;
  match: {
    id: string;
    starts_at: string;
    status: MatchStatus;
    stage: string | null;
    group_name: string | null;
    home_score: number | null;
    away_score: number | null;
    home: { name: string; code: string | null; flag_url: string | null } | null;
    away: { name: string; code: string | null; flag_url: string | null } | null;
  } | null;
}

export async function fetchUserPredictions(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<UserPredictionEntry[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select(
      `match_id,
       home_score,
       away_score,
       points,
       exact_hit,
       winner_hit,
       created_at,
       updated_at,
       match:matches!predictions_match_id_fkey(
         id, starts_at, status, stage, group_name, home_score, away_score,
         home:teams!matches_home_team_id_fkey(name, code, flag_url),
         away:teams!matches_away_team_id_fkey(name, code, flag_url)
       )`,
    )
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as RawRow[];
  return rows
    .filter((r) => r.match)
    .map((r) => {
      const m = r.match!;
      return {
        matchId: r.match_id,
        startsAt: m.starts_at,
        status: m.status,
        stage: m.stage,
        groupName: m.group_name,
        homeName: m.home?.name ?? "TBD",
        homeCode: m.home?.code ?? null,
        homeFlagUrl: m.home?.flag_url ?? null,
        awayName: m.away?.name ?? "TBD",
        awayCode: m.away?.code ?? null,
        awayFlagUrl: m.away?.flag_url ?? null,
        homeScore: m.home_score,
        awayScore: m.away_score,
        predHome: r.home_score,
        predAway: r.away_score,
        points: r.points,
        exactHit: r.exact_hit,
        winnerHit: r.winner_hit,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      } satisfies UserPredictionEntry;
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
