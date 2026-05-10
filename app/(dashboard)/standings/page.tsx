import { Table as TableIcon } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getGroupStandings } from "@/lib/standings/get-group-standings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TeamFlag } from "@/components/teams/team-flag";
import { EmptyState } from "@/components/layout/empty-state";
import { cn } from "@/lib/utils";

export default async function StandingsPage() {
  await requireUser();
  const grouped = await getGroupStandings();

  const groupNames = Array.from(grouped.keys()).sort();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 md:py-8">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <TableIcon className="size-6 text-primary" />
          Tablas de grupo
        </h1>
        <p className="text-muted-foreground">
          Se actualiza automáticamente con cada resultado cargado. Top 2 de cada
          grupo clasifica + 8 mejores terceros.
        </p>
      </header>

      {groupNames.length === 0 ? (
        <EmptyState
          title="Todavía no hay resultados cargados"
          description="Las tablas se generan cuando el admin carga el resultado del primer partido."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {groupNames.map((g) => {
            const rows = grouped.get(g) ?? [];
            return (
              <Card key={g}>
                <CardHeader>
                  <CardTitle className="text-base">Grupo {g}</CardTitle>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-9 pl-4">#</TableHead>
                        <TableHead>Equipo</TableHead>
                        <TableHead className="text-right">PJ</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">G</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">E</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">P</TableHead>
                        <TableHead className="text-right">DG</TableHead>
                        <TableHead className="text-right pr-4 font-bold">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow
                          key={r.teamId}
                          className={cn(
                            r.position <= 2 && "bg-success/5",
                            r.position === 3 && "bg-accent/10",
                          )}
                        >
                          <TableCell className="pl-4 font-mono">
                            {r.position}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-2">
                              <TeamFlag
                                url={r.teamFlagUrl}
                                alt={r.teamName}
                                size="sm"
                              />
                              <span className="font-medium">{r.teamName}</span>
                              {r.teamCode && (
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {r.teamCode}
                                </span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.played}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums sm:table-cell">
                            {r.won}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums sm:table-cell">
                            {r.drawn}
                          </TableCell>
                          <TableCell className="hidden text-right tabular-nums sm:table-cell">
                            {r.lost}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                          </TableCell>
                          <TableCell className="text-right pr-4 font-bold tabular-nums">
                            {r.points}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
