type MatchStatus = "scheduled" | "locked" | "live" | "finished";

export interface MatchInput {
  id: string;
  status: MatchStatus;
  starts_at: string;
}

export interface PredictionInput {
  match_id: string;
  points: number;
  exact_hit: boolean;
  winner_hit: boolean;
}

export interface GroupStats {
  totalMatches: number;
  finishedMatches: number;
  liveMatches: number;
  predictionsCount: number;
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
}

export function computeGroupStats(
  matches: MatchInput[],
  predictions: PredictionInput[],
): GroupStats {
  const matchIds = new Set(matches.map((m) => m.id));
  const myPreds = predictions.filter((p) => matchIds.has(p.match_id));

  let finished = 0;
  let live = 0;
  for (const m of matches) {
    if (m.status === "finished") finished++;
    if (m.status === "live") live++;
  }

  let points = 0;
  let exact = 0;
  let winner = 0;
  for (const p of myPreds) {
    points += p.points ?? 0;
    if (p.exact_hit) exact++;
    if (p.winner_hit) winner++;
  }

  return {
    totalMatches: matches.length,
    finishedMatches: finished,
    liveMatches: live,
    predictionsCount: myPreds.length,
    totalPoints: points,
    exactHits: exact,
    winnerHits: winner,
  };
}
