import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TeamFlag } from "@/components/teams/team-flag";
import { MatchRow, type MatchRowProps } from "@/components/matches/match-row";
import type { GroupStats } from "@/lib/matches/group-stats";

interface GroupBlock {
  groupName: string;
  teams: { name: string; flagUrl: string | null }[];
  stats: GroupStats;
  matches: MatchRowProps[];
}

export function GroupsAccordion({
  groups,
  defaultOpen,
}: {
  groups: GroupBlock[];
  defaultOpen?: string[];
}) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      {groups.map((g) => (
        <AccordionItem key={g.groupName} value={g.groupName}>
          <AccordionTrigger className="px-4">
            <div className="flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-base font-extrabold text-primary-foreground">
                  {g.groupName}
                </span>
                <div className="-space-x-1.5 flex">
                  {g.teams.map((t) => (
                    <TeamFlag
                      key={t.name}
                      url={t.flagUrl}
                      alt={t.name}
                      size="sm"
                      rounded
                      className="ring-2 ring-background"
                    />
                  ))}
                </div>
              </div>

              <GroupStatsPills stats={g.stats} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4">
              {g.matches.map((m) => (
                <MatchRow key={m.matchId} {...m} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function GroupStatsPills({ stats }: { stats: GroupStats }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className="rounded-full bg-muted px-2 py-0.5 font-bold">
        {stats.finishedMatches}/{stats.totalMatches} jugados
      </span>
      {stats.totalPoints > 0 && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary">
          {stats.totalPoints} pts
        </span>
      )}
      {stats.exactHits > 0 && (
        <span className="rounded-full bg-success/15 px-2 py-0.5 font-bold text-success">
          {stats.exactHits} exactos
        </span>
      )}
      {stats.predictionsCount > 0 && stats.totalPoints === 0 && (
        <span className="rounded-full bg-accent/30 px-2 py-0.5 font-bold text-accent-foreground">
          {stats.predictionsCount} pron.
        </span>
      )}
    </div>
  );
}
