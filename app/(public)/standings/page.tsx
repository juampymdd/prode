import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getGroupStandings } from "@/lib/standings/get-group-standings";
import { GroupsGrid } from "@/components/standings/groups-grid";
import {
  MatchSearch,
  type SearchableMatch,
} from "@/components/standings/match-search";
import { StandingsRealtime } from "@/components/standings/standings-realtime";
import { getUser } from "@/lib/auth/get-user";

export const metadata: Metadata = {
  title: "Tablas en vivo · Prode Mundial 2026",
  description:
    "Las 12 tablas de la fase de grupos del Mundial 2026 en vivo. Buscá partidos por equipo y mirá cómo se va dibujando el bracket.",
};

interface MatchRow {
  id: string;
  starts_at: string;
  status: "scheduled" | "locked" | "live" | "finished";
  home_score: number | null;
  away_score: number | null;
  group_name: string | null;
  stage: string | null;
  home: { name: string; code: string | null; flag_url: string | null } | null;
  away: { name: string; code: string | null; flag_url: string | null } | null;
}

async function getSearchableMatches(): Promise<SearchableMatch[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(
      "id, starts_at, status, home_score, away_score, stage, group_name, home:teams!matches_home_team_id_fkey(name, code, flag_url), away:teams!matches_away_team_id_fkey(name, code, flag_url)",
    )
    .order("starts_at", { ascending: true });

  return ((data ?? []) as unknown as MatchRow[])
    .filter((m) => m.home && m.away)
    .map((m) => ({
      id: m.id,
      startsAt: m.starts_at,
      status: m.status,
      homeScore: m.home_score,
      awayScore: m.away_score,
      groupName: m.group_name,
      stage: m.stage,
      homeName: m.home!.name,
      homeCode: m.home!.code,
      homeFlagUrl: m.home!.flag_url,
      awayName: m.away!.name,
      awayCode: m.away!.code,
      awayFlagUrl: m.away!.flag_url,
    }));
}

export default async function StandingsPage() {
  const [grouped, matches, user] = await Promise.all([
    getGroupStandings(),
    getSearchableMatches(),
    getUser(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:py-12">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            <TableIcon className="size-6 text-primary md:size-7" />
            Tablas en vivo
          </h1>
          <StandingsRealtime />
        </div>
        <p className="max-w-2xl text-muted-foreground">
          Las 12 tablas de la fase de grupos del Mundial 2026. Arrancan en
          cero y se actualizan automáticamente cuando se cargan los resultados.
          Top 2 de cada grupo clasifica + los 8 mejores terceros.
        </p>
        {!user && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button asChild>
              <Link href="/signup">
                Sumarme al prode
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        )}
      </header>

      <MatchSearch matches={matches} />

      <GroupsGrid groups={grouped} />
    </div>
  );
}
