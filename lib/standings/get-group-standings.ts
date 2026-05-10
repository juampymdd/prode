import { createClient } from "@/lib/supabase/server";

export interface StandingRow {
  groupName: string;
  position: number;
  teamId: string;
  teamName: string;
  teamCode: string | null;
  teamFlagUrl: string | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
}

interface ViewRow {
  group_name: string;
  team_id: string;
  team_name: string;
  team_code: string | null;
  team_flag_url: string | null;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  position: number;
}

export async function getGroupStandings(): Promise<Map<string, StandingRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("group_standings")
    .select("*");

  if (error) {
    console.error("[standings] query failed", error);
    throw new Error(`No pudimos cargar las tablas: ${error.message}`);
  }

  const grouped = new Map<string, StandingRow[]>();
  for (const r of (data ?? []) as ViewRow[]) {
    const list = grouped.get(r.group_name) ?? [];
    list.push({
      groupName: r.group_name,
      position: r.position,
      teamId: r.team_id,
      teamName: r.team_name,
      teamCode: r.team_code,
      teamFlagUrl: r.team_flag_url,
      points: r.points,
      played: r.played,
      won: r.won,
      drawn: r.drawn,
      lost: r.lost,
      goalsFor: r.goals_for,
      goalsAgainst: r.goals_against,
      goalDiff: r.goal_diff,
    });
    grouped.set(r.group_name, list);
  }
  for (const [k, v] of grouped) {
    v.sort((a, b) => a.position - b.position);
    grouped.set(k, v);
  }
  return grouped;
}
