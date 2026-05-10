export interface PredictionPointsInput {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number;
  actualAwayScore: number;
}

export interface PredictionPointsResult {
  points: number;
  exactHit: boolean;
  winnerHit: boolean;
}

type Outcome = "home" | "away" | "draw";

function outcome(home: number, away: number): Outcome {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

/**
 * Pure scoring function.
 *
 *   - Exact result: 5 points (terminal).
 *   - Correct winner / correct draw: 3 points.
 *   - Correct goal difference: 2 points.
 *   - Each team's score matched: +1 point.
 *   - Floors at 0; never returns negative points.
 */
export function calculatePredictionPoints(
  input: PredictionPointsInput,
): PredictionPointsResult {
  const ph = input.predictedHomeScore;
  const pa = input.predictedAwayScore;
  const ah = input.actualHomeScore;
  const aa = input.actualAwayScore;

  const exactHit = ph === ah && pa === aa;
  const winnerHit = outcome(ph, pa) === outcome(ah, aa);

  if (exactHit) {
    return { points: 5, exactHit: true, winnerHit: true };
  }

  let points = 0;
  if (winnerHit) points += 3;
  if (ph - pa === ah - aa) points += 2;
  if (ph === ah) points += 1;
  if (pa === aa) points += 1;

  return {
    points: Math.max(0, points),
    exactHit: false,
    winnerHit,
  };
}
