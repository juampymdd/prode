import { Crown, Medal } from "lucide-react";
import { TeamFlag } from "@/components/teams/team-flag";
import { TeamTrigger } from "@/components/teams/team-trigger";
import { cn } from "@/lib/utils";

export interface TeamPodiumEntry {
  position: 1 | 2 | 3;
  /** Team data — present when the result is known. Absent → placeholder. */
  name?: string;
  code?: string | null;
  flagUrl?: string | null;
  /** Optional subtitle below the name (e.g. "ganó 3-1 a ARG"). */
  subtitle?: string;
}

const STYLE: Record<
  1 | 2 | 3,
  { bg: string; ring: string; height: string; label: string }
> = {
  1: { bg: "bg-gold/20", ring: "ring-gold", height: "h-44", label: "1°" },
  2: { bg: "bg-silver/30", ring: "ring-silver", height: "h-36", label: "2°" },
  3: { bg: "bg-bronze/20", ring: "ring-bronze", height: "h-32", label: "3°" },
};

const DEFAULT_LABEL: Record<1 | 2 | 3, string> = {
  1: "Campeón",
  2: "Sub-campeón",
  3: "Tercer puesto",
};

function TeamPodiumStep({
  entry,
  place,
}: {
  entry: TeamPodiumEntry | undefined;
  place: 1 | 2 | 3;
}) {
  const s = STYLE[place];
  const known = !!entry?.name;
  const displayName = known ? entry!.name! : DEFAULT_LABEL[place];

  const flag = (
    <TeamFlag
      url={entry?.flagUrl ?? null}
      alt={entry?.name ?? DEFAULT_LABEL[place]}
      size="lg"
      className={cn(
        "ring-2 ring-offset-2 ring-offset-background",
        known ? s.ring : "ring-border opacity-70",
      )}
    />
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {known && entry?.code ? (
        <TeamTrigger code={entry.code}>{flag}</TeamTrigger>
      ) : (
        flag
      )}

      <div className="space-y-0.5 text-center">
        <p
          className={cn(
            "max-w-[14ch] truncate text-sm font-bold",
            !known && "italic text-muted-foreground",
          )}
        >
          {displayName}
        </p>
        {known && entry?.code && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            {entry.code}
          </p>
        )}
      </div>

      <div
        className={cn(
          "flex w-full flex-col items-center justify-end rounded-t-xl border border-b-0 px-2 pb-2 pt-3",
          s.bg,
          s.height,
          !known && "opacity-70",
        )}
      >
        {entry?.subtitle && (
          <p
            className={cn(
              "max-w-[14ch] text-center text-[10px] font-medium leading-tight text-foreground/80",
              !known && "text-muted-foreground/70",
            )}
          >
            {entry.subtitle}
          </p>
        )}
        <div className="mt-auto flex items-center gap-1 text-xl font-extrabold">
          {place === 1 ? (
            <Crown className="size-5 text-gold drop-shadow" aria-hidden />
          ) : (
            <Medal
              className={cn(
                "size-4",
                place === 2 ? "text-silver" : "text-bronze",
              )}
              aria-hidden
            />
          )}
          <span>{s.label}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 3-team podium for the World Cup final + 3rd-place match. Mirrors the
 * player Podium visually (gold / silver / bronze stairs) but renders flags
 * instead of avatars and skips the points number.
 */
export function TeamPodium({ entries }: { entries: TeamPodiumEntry[] }) {
  const first = entries.find((e) => e.position === 1);
  const second = entries.find((e) => e.position === 2);
  const third = entries.find((e) => e.position === 3);

  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      <TeamPodiumStep entry={second} place={2} />
      <TeamPodiumStep entry={first} place={1} />
      <TeamPodiumStep entry={third} place={3} />
    </div>
  );
}
