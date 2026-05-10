import { Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getGlobalRanking } from "@/lib/ranking/get-global-ranking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Podium } from "@/components/ranking/podium";
import { RankingTable } from "@/components/ranking/ranking-table";
import { EmptyState } from "@/components/layout/empty-state";

export default async function RankingPage() {
  const user = await requireUser();
  const ranking = await getGlobalRanking();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <Trophy className="size-6 text-primary" />
          Ranking
        </h1>
        <p className="text-muted-foreground">
          Ordenado por puntos, exactos, ganadores y nombre.
        </p>
      </header>

      {ranking.length === 0 ? (
        <EmptyState
          title="Sin participantes con puntos"
          description="Cuando se carguen resultados de partidos, el ranking se llena."
        />
      ) : (
        <>
          {ranking.length >= 1 && (
            <Card className="border-accent/30 bg-card/80 backdrop-blur">
              <CardContent className="py-6">
                <Podium
                  top={ranking.slice(0, 3).map((r) => ({
                    position: r.position,
                    name: r.name,
                    totalPoints: r.totalPoints,
                    exactHits: r.exactHits,
                    isMe: r.userId === user.id,
                  }))}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tabla completa</CardTitle>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <RankingTable rows={ranking} meUserId={user.id} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
