import { Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getGlobalRanking } from "@/lib/ranking/get-global-ranking";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Podium, type PodiumEntry } from "@/components/ranking/podium";
import { RankingTable } from "@/components/ranking/ranking-table";
import { EmptyState } from "@/components/layout/empty-state";

export default async function RankingPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [ranking, { count: finishedCount }] = await Promise.all([
    getGlobalRanking(),
    supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("status", "finished"),
  ]);

  const firstMatchPlayed = (finishedCount ?? 0) > 0;

  // Until the first match has finished, the podium renders three empty
  // placeholder slots with "Campeón / Sub-campeón / Tercer puesto" labels.
  const podiumEntries: PodiumEntry[] = firstMatchPlayed
    ? ranking.slice(0, 3).map((r) => ({
        position: r.position as 1 | 2 | 3,
        name: r.name,
        totalPoints: r.totalPoints,
        exactHits: r.exactHits,
        isMe: r.userId === user.id,
      }))
    : [];

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <Trophy className="size-6 text-primary md:size-7" aria-hidden />
          Ranking
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Ordenado por puntos, exactos, ganadores y nombre.
        </p>
      </header>

      <Card className="border-accent/30 bg-card/80 backdrop-blur">
        <CardContent className="space-y-3 py-6">
          <Podium top={podiumEntries} />
          {!firstMatchPlayed && (
            <p className="text-center text-xs italic text-muted-foreground">
              El podio se completa cuando termine el primer partido del Mundial.
            </p>
          )}
        </CardContent>
      </Card>

      {ranking.length === 0 ? (
        <EmptyState
          title="Sin participantes todavía"
          description="Cuando se aprueben las primeras solicitudes y los jugadores carguen pronósticos, los vas a ver acá."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabla completa</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <RankingTable rows={ranking} meUserId={user.id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
