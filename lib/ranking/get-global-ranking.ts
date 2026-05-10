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

interface ProfileRow {
  user_id: string;
  name: string | null;
  is_app_admin: boolean;
}

interface PredictionRow {
  user_id: string;
  points: number;
  exact_hit: boolean;
  winner_hit: boolean;
}

export async function getGlobalRanking(): Promise<RankingEntry[]> {
  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: predictions, error: predsError }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, name, is_app_admin"),
      supabase
        .from("predictions")
        .select("user_id, points, exact_hit, winner_hit"),
    ]);

  if (profilesError) {
    console.error("[ranking] profiles query failed", profilesError);
    throw new Error(`No pudimos cargar el ranking: ${profilesError.message}`);
  }
  if (predsError) {
    console.error("[ranking] predictions query failed", predsError);
    throw new Error(`No pudimos cargar el ranking: ${predsError.message}`);
  }

  const stats = new Map<
    string,
    { points: number; exact: number; winner: number; count: number }
  >();
  for (const p of (predictions ?? []) as PredictionRow[]) {
    const cur = stats.get(p.user_id) ?? { points: 0, exact: 0, winner: 0, count: 0 };
    cur.points += p.points ?? 0;
    if (p.exact_hit) cur.exact += 1;
    if (p.winner_hit) cur.winner += 1;
    cur.count += 1;
    stats.set(p.user_id, cur);
  }

  const rows = ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const s = stats.get(profile.user_id) ?? {
      points: 0,
      exact: 0,
      winner: 0,
      count: 0,
    };
    return {
      userId: profile.user_id,
      name: profile.name ?? "Jugador",
      isAdmin: profile.is_app_admin,
      totalPoints: s.points,
      exactHits: s.exact,
      winnerHits: s.winner,
      predictionsCount: s.count,
    };
  });

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.exactHits !== a.exactHits) return b.exactHits - a.exactHits;
    if (b.winnerHits !== a.winnerHits) return b.winnerHits - a.winnerHits;
    return a.name.localeCompare(b.name, "es");
  });

  return rows.map((r, i) => ({ position: i + 1, ...r }));
}
