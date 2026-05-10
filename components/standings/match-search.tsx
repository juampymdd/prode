"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MatchSummary } from "@/components/matches/match-summary";

export interface SearchableMatch {
  id: string;
  startsAt: string;
  status: "scheduled" | "locked" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  groupName: string | null;
  stage: string | null;
  homeName: string;
  homeCode: string | null;
  homeFlagUrl: string | null;
  awayName: string;
  awayCode: string | null;
  awayFlagUrl: string | null;
}

// Strip diacritics + lowercase so "mexico" matches "México", "argentina"
// matches "Argentina", and so on.
// U+0300–U+036F is the Combining Diacritical Marks block. NFD splits a
// letter like "é" into "e" + combining acute, then this regex strips the
// combining mark, leaving "e".
const DIACRITICS = /[̀-ͯ]/g;

function normalize(s: string) {
  return s.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

interface MatchSearchProps {
  matches: SearchableMatch[];
}

export function MatchSearch({ matches }: MatchSearchProps) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const trimmed = deferred.trim();

  const filtered = useMemo(() => {
    const q = normalize(trimmed);
    if (q.length === 0) return [];
    return matches
      .filter(
        (m) =>
          normalize(m.homeName).includes(q) ||
          normalize(m.awayName).includes(q),
      )
      .slice()
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [trimmed, matches]);

  const showResults = trimmed.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar partidos por equipo (Argentina, Brasil...)"
          className="pl-9 pr-10"
          aria-label="Buscar partidos por nombre de equipo"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Limpiar búsqueda"
            className="absolute right-1.5 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {showResults &&
        (filtered.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            No encontramos partidos que involucren a{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{trimmed}&rdquo;
            </span>
            .
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "partido" : "partidos"} ordenados por
              fecha
            </p>
            <ul className="grid gap-2">
              {filtered.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border bg-card p-3 shadow-xs"
                >
                  <MatchSummary
                    homeName={m.homeName}
                    awayName={m.awayName}
                    homeCode={m.homeCode}
                    awayCode={m.awayCode}
                    homeFlagUrl={m.homeFlagUrl}
                    awayFlagUrl={m.awayFlagUrl}
                    startsAt={m.startsAt}
                    status={m.status}
                    homeScore={m.homeScore}
                    awayScore={m.awayScore}
                    stage={m.stage}
                    groupName={m.groupName}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
