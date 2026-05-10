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

  it("ganador correcto, sin diff → 3 pts", () => {
    // pred 4-1 (home), act 2-0 (home). Diff 3 vs 2.
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

  it("diferencia de gol correcta + ganador → 5 pts", () => {
    // pred 3-2 (home gana por 1), act 2-1 (home gana por 1).
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

  it("ganador equivocado pero un score coincide → 0 pts (la regla por equipo no existe)", () => {
    // pred 2-3 (away gana), act 2-1 (home gana). home_score coincide pero ya no suma.
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 3,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(0);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(false);
  });

  it("ganador correcto sin diff → 3 pts (ya no hay bonus por goles parciales)", () => {
    // pred 3-1 (home), act 2-1 (home). away_score coincidía pero esa regla se quitó.
    const r = calculatePredictionPoints({
      predictedHomeScore: 3,
      predictedAwayScore: 1,
      actualHomeScore: 2,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(3);
    expect(r.exactHit).toBe(false);
    expect(r.winnerHit).toBe(true);
  });

  it("predicción totalmente incorrecta → 0 pts", () => {
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

  it("empate predicho pero hubo ganador → 0 pts", () => {
    const r = calculatePredictionPoints({
      predictedHomeScore: 2,
      predictedAwayScore: 2,
      actualHomeScore: 3,
      actualAwayScore: 1,
    });
    expect(r.points).toBe(0);
    expect(r.winnerHit).toBe(false);
  });

  it("ganador real fue empate, predijo ganador → 0 pts", () => {
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
