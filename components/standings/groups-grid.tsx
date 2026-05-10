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
import { TeamTrigger } from "@/components/teams/team-trigger";
import { EmptyState } from "@/components/layout/empty-state";
import type { StandingRow } from "@/lib/standings/get-group-standings";
import { cn } from "@/lib/utils";

interface GroupsGridProps {
  groups: Map<string, StandingRow[]>;
}

export function GroupsGrid({ groups }: GroupsGridProps) {
  const groupNames = Array.from(groups.keys()).sort();

  if (groupNames.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay grupos cargados"
        description="Cuando el fixture esté disponible, vas a ver acá las 12 tablas en cero."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {groupNames.map((g) => {
        const rows = groups.get(g) ?? [];
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
                        <TeamTrigger
                          code={r.teamCode ?? r.teamId}
                          className="flex items-center gap-2"
                        >
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
                        </TeamTrigger>
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
  );
}
