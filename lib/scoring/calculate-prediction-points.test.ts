import { describe, it, expect } from "vitest";
import { calculatePredictionPoints } from "./calculate-prediction-points";

describe("calculatePredictionPoints", () => {
  it("resultado exacto → 5 pts y exactHit", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r).toEqual({ points: 5, exactHit: true, winnerHit: true });
  });

  it("empate exacto → 5 pts", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 0,
      predictedAwayScore: 0,
      actualHomeScore: 0,
      actualAwayScore: 0,
    });
    expect(r).toEqual({ points: 5, exactHit: true, winnerHit: true });
  });

  it("ganador correcto, sin acierto exacto, sin diff, sin team → 3 pts", () => {
    // pred 4-1 (home), act 2-0 (home). Diff 3 vs 2. Sin team match.
    const r = calculatePredictionPoints({
      predictedHomeScore: 4,
      predictedAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 0,
    });
    expect(r.points).toBe(3);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(true);
  });

  it("empate predicho y empate real con score distinto → 5 pts (winner + diff)", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 1,
      predictedAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 2,
    });
    expect(r.points).toBe(5);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(true);
  });

  it("diferencia de gol correcta sin team match → 5 pts (winner + diff)", () => {
    // pred 3-2 (home gana por 1), act 2-1 (home gana por 1). Sin team match.
    const r = calculatePredictionPoints({
      predictedHomeScore: 3,
      predictedAwayScore: 2,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(5);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(true);
  });

  it("goles de local correctos pero ganador equivocado → 1 pt", () => {
    // pred 2-3 (away gana), act 2-1 (home gana). home matches.
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 3,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(1);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(false);
  });

  it("goles de visitante correctos + ganador correcto → 4 pts", () => {
    // pred 3-1 (home), act 2-1 (home). away match. diff 2 vs 1.
    const r = calculatePredictionPoints({
      predictedHomeScore: 3,
      predictedAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(4);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(true);
  });

  it("predicción totalmente incorrecta → 0 pts", () => {
    // pred 0-3, act 2-1. Winner distinto, diff distinto, sin teams.
    const r = calculatePredictionPoints({
      predictedHomeScore: 0,
      predictedAwayScore: 3,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(0);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(false);
  });

  it("empate predicho pero hubo ganador, sin teams → 0 pts", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 2,
      actualHomeScore: 3,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(0);
    expect(r.winnerHit).toBe(false);
  });

  it("ganador real fue empate, predijo ganador, sin teams → 0 pts", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 1,
      actualHomeScore: 3,
      actualAwayScore: 3,
    });
    expect(r.points).toBe(0);
    expect(r.winnerHit).toBe(false);
  });
});
