import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Ban, Hand, ListChecks, Trophy } from "lucide-react";
import { getUserWithProfile, isProfileDisabled } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getGlobalRanking } from "@/lib/ranking/get-global-ranking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Podium } from "@/components/ranking/podium";
import { MatchCard } from "@/components/matches/match-card";
import { HypeCountdown } from "@/components/matches/hype-countdown";
import { EmptyState } from "@/components/layout/empty-state";

interface MatchRow {
  id: string;
  starts_at: string;
  status: "scheduled" | "locked" | "live" | "finished";
  home_score: number | null;
  away_score: number | null;
  stage: string | null;
  group_name: string | null;
  home: { name: string; code: string | null; flag_url: string | null } | null;
  away: { name: string; code: string | null; flag_url: string | null } | null;
}

export default async function DashboardPage() {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const [{ data: matches }, ranking, { count: predictionsCount }, { count: finishedCount }] =
    await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, starts_at, status, home_score, away_score, stage, group_name, home:teams!matches_home_team_id_fkey(name, code, flag_url), away:teams!matches_away_team_id_fkey(name, code, flag_url)",
        )
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(3),
      getGlobalRanking(),
      supabase
        .from("predictions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("matches")
        .select("id", { count: "exact", head: true })
        .eq("status", "finished"),
    ]);

  const upcoming = (matches ?? []) as unknown as MatchRow[];
  const myEntry = ranking.find((r) => r.userId === user.id);
  const myPredCount = predictionsCount ?? 0;

  // Podium and "tu posición" stay hidden until the first match has finished.
  // Before that, everyone sits at 0 and showing positions would be noise.
  const firstMatchPlayed = (finishedCount ?? 0) > 0;
  const nextKickoff = upcoming[0]?.starts_at ?? null;

  const accountDisabled = isProfileDisabled(profile);

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 md:py-8">
      {accountDisabled && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <Ban className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Tu cuenta está deshabilitada.</p>
            <p className="text-destructive/80">
              Podés mirar partidos y resultados, pero no cargar ni editar
              pronósticos. Tampoco aparecés en el ranking. Hablá con un admin
              para reactivarla.
            </p>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground shadow-xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">
              Mundial 2026
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-extrabold leading-tight sm:text-3xl">
              <span>Hola{profile?.name ? `, ${profile.name}` : ""}</span>
              <Hand className="size-6 sm:size-7" aria-hidden />
            </h1>
            <p className="text-sm opacity-90">
              Tu pronóstico, tus puntos, tu lugar en el ranking.
            </p>
          </div>
          {firstMatchPlayed && myEntry && (
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm ring-1 ring-white/20">
              <p className="text-xs uppercase tracking-wider opacity-80">Tu posición</p>
              <p className="text-3xl font-extrabold leading-none">
                #{myEntry.position}
              </p>
              <p className="mt-1 text-xs opacity-90">
                {myEntry.totalPoints} pts · {myPredCount} pron.
              </p>
            </div>
          )}
        </div>

        {nextKickoff && (
          <div className="mt-6 border-t border-white/15 pt-5">
            <HypeCountdown
              startsAt={nextKickoff}
              label={firstMatchPlayed ? "Próximo partido en" : "El Mundial arranca en"}
            />
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="border-primary/20 transition hover:border-primary/40">
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Predicciones
              </p>
              <p className="text-base font-semibold">Cargar pronósticos</p>
            </div>
            <Button asChild size="sm">
              <Link href="/partidos">
                <ListChecks className="size-4" />
                Ir a partidos
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-accent/40 transition hover:border-accent">
          <CardContent className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Posiciones
              </p>
              <p className="text-base font-semibold">Ranking del prode</p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href="/ranking">
                <Trophy className="size-4" />
                Ver podio
                <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Top 3 podium */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="size-5 text-gold" aria-hidden />
            Top 3
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/ranking">
              Ver tabla
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
        {ranking.length === 0 ? (
          <EmptyState
            title="El podio está vacío"
            description="Sumá puntos prediciendo los partidos. Apenas se cierre uno, el ranking arranca."
          />
        ) : (
          <Card className="border-accent/30 bg-card/80 backdrop-blur">
            <CardContent className="py-6">
              <Podium
                top={
                  firstMatchPlayed
                    ? ranking.slice(0, 3).map((r) => ({
                        position: r.position as 1 | 2 | 3,
                        name: r.name,
                        totalPoints: r.totalPoints,
                        exactHits: r.exactHits,
                      }))
                    : []
                }
              />
              {!firstMatchPlayed && (
                <p className="mt-4 text-center text-xs italic text-muted-foreground">
                  El podio se llena con los primeros resultados.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {/* Upcoming matches */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Próximos partidos</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/partidos">
              Ver todos
              <ArrowRight className="size-3" />
            </Link>
          </Button>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="Sin partidos próximos"
            description="Volvé pronto."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard
                key={m.id}
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
