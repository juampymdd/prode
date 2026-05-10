import { createClient } from "@/lib/supabase/server";

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  isAdmin: boolean;
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
  predictionsCount: number;
}

interface RpcRow {
  user_id: string;
  name: string | null;
  is_app_admin: boolean;
  total_points: number;
  exact_hits: number;
  winner_hits: number;
  predictions_count: number;
}

// Backed by the public.get_global_ranking() RPC (SECURITY DEFINER) so the
// leaderboard stays accurate regardless of per-prediction RLS, while
// individual prediction rows remain hidden from rival players until kickoff.
export async function getGlobalRanking(): Promise<RankingEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_global_ranking");

  if (error) {
    console.error("[ranking] rpc failed", { code: error.code });
    throw new Error("No pudimos cargar el ranking.");
  }

  const rows = ((data ?? []) as RpcRow[]).map((r) => ({
    userId: r.user_id,
    name: r.name ?? "Jugador",
    isAdmin: r.is_app_admin,
    totalPoints: r.total_points,
    exactHits: r.exact_hits,
    winnerHits: r.winner_hits,
    predictionsCount: r.predictions_count,
  }));

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    if (b.winnerHits !== a.winnerHits) return b.winnerHits - a.winnerHits;
    return a.name.localeCompare(b.name, "es");
  });

  return rows.map((r, i) => ({ position: i + 1, ...r }));
}
