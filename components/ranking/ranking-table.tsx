import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  isAdmin: boolean;
  totalPoints: number;
  exactHits: number;
  winnerHits: number;
  predictionsCount: number;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function positionStyle(pos: number) {
  if (pos === 1) return "bg-gold/15 text-gold-foreground ring-gold/40";
  if (pos === 2) return "bg-silver/30 ring-silver/40";
  if (pos === 3) return "bg-bronze/15 ring-bronze/40";
  return "bg-muted";
}

export function RankingTable({
  rows,
  meUserId,
}: {
  rows: RankingEntry[];
  meUserId?: string;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 pl-4">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead className="text-right">Pts</TableHead>
          <TableHead className="text-right">Exactos</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Ganadores</TableHead>
          <TableHead className="hidden text-right sm:table-cell pr-4">
            Cargadas
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow
            key={r.userId}
            className={cn(
              meUserId && r.userId === meUserId
                ? "bg-primary/8 hover:bg-primary/12"
                : undefined,
            )}
          >
            <TableCell className="pl-4">
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-inset",
                  positionStyle(r.position),
                )}
              >
                {r.position}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                    {initials(r.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{r.name}</span>
                {r.isAdmin && (
                  <span className="rounded bg-accent/40 px-1 py-px text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                    Admin
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right font-bold tabular-nums">
              {r.totalPoints}
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.exactHits}</TableCell>
            <TableCell className="hidden text-right tabular-nums sm:table-cell">
              {r.winnerHits}
            </TableCell>
            <TableCell className="hidden text-right tabular-nums sm:table-cell pr-4">
              {r.predictionsCount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
