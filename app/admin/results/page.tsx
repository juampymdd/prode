import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { MatchSummary } from "@/components/matches/match-summary";
import { ResultForm, RecalcButton } from "@/components/admin/result-form";
import { ClearResultButton } from "@/components/admin/clear-result-button";
import {
  ResultsTabs,
  isResultTabKey,
  type ResultTabKey,
} from "@/components/admin/results-tabs";

type Row = {
  id: string;
  starts_at: string;
  status: "scheduled" | "locked" | "live" | "finished";
  home_score: number | null;
  away_score: number | null;
  stage: string | null;
  group_name: string | null;
  home: { name: string; code: string | null; flag_url: string | null } | null;
  away: { name: string; code: string | null; flag_url: string | null } | null;
};

export default async function AdminResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const active: ResultTabKey = isResultTabKey(sp.tab) ? sp.tab : "pendientes";

  const supabase = await createClient();
  const { data: matches } = await supabase
    .from("matches")
    .select(
      "id, starts_at, status, home_score, away_score, stage, group_name, home:teams!matches_home_team_id_fkey(name, code, flag_url), away:teams!matches_away_team_id_fkey(name, code, flag_url)",
    )
    .order("starts_at", { ascending: true });

  const list = (matches ?? []) as unknown as Row[];
  const hasResult = (m: Row) => m.home_score != null && m.away_score != null;
  const pending = list.filter((m) => !hasResult(m));
  const loaded = list.filter(hasResult);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Resultados</h1>
        <p className="text-muted-foreground">
          Al guardar el resultado, el partido pasa a finalizado y se recalculan
          los puntos de todas las predicciones automáticamente.
        </p>
      </header>

      <ResultsTabs
        active={active}
        counts={{ pendientes: pending.length, cargados: loaded.length }}
      />

      {active === "pendientes" ? (
        pending.length === 0 ? (
          <EmptyState
            title="No hay partidos pendientes"
            description="Cuando agregues partidos, vas a verlos acá listos para cargar resultado."
          />
        ) : (
          <div className="grid gap-3">
            {pending.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="sr-only">
                    {m.home?.name} vs {m.away?.name}
                  </CardTitle>
                  <MatchSummary
                    homeName={m.home?.name ?? "TBD"}
                    awayName={m.away?.name ?? "TBD"}
                    homeCode={m.home?.code}
                    awayCode={m.away?.code}
                    homeFlagUrl={m.home?.flag_url}
                    awayFlagUrl={m.away?.flag_url}
                    startsAt={m.starts_at}
                    status={m.status}
                    homeScore={m.home_score}
                    awayScore={m.away_score}
                    stage={m.stage}
                    groupName={m.group_name}
                  />
                </CardHeader>
                <CardContent className="border-t pt-4">
                  <ResultForm
                    matchId={m.id}
                    defaultHome={m.home_score}
                    defaultAway={m.away_score}
                    finished={false}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : loaded.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Todavía no cargaste ningún resultado.
        </p>
      ) : (
        <div className="grid gap-3">
          {loaded.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <CardTitle className="sr-only">
                  {m.home?.name} vs {m.away?.name}
                </CardTitle>
                <MatchSummary
                  homeName={m.home?.name ?? "TBD"}
                  awayName={m.away?.name ?? "TBD"}
                  homeCode={m.home?.code}
                  awayCode={m.away?.code}
                  homeFlagUrl={m.home?.flag_url}
                  awayFlagUrl={m.away?.flag_url}
                  startsAt={m.starts_at}
                  status={m.status}
                  homeScore={m.home_score}
                  awayScore={m.away_score}
                  stage={m.stage}
                  groupName={m.group_name}
                />
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-3 border-t pt-4">
                <ResultForm
                  matchId={m.id}
                  defaultHome={m.home_score}
                  defaultAway={m.away_score}
                  finished
                />
                <RecalcButton matchId={m.id} />
                <div className="ml-auto">
                  <ClearResultButton
                    matchId={m.id}
                    matchLabel={`${m.home?.name ?? "TBD"} vs ${m.away?.name ?? "TBD"}`}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
