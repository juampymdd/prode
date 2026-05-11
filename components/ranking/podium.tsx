import { Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export interface PodiumEntry {
  position: 1 | 2 | 3;
  // Player data: present once results exist. When absent, the slot renders
  // in placeholder mode ("Por definir" / dash).
  name?: string;
  totalPoints?: number;
  exactHits?: number;
  isMe?: boolean;
  // Optional label that replaces "Por definir" in placeholder mode — used
  // by the landing to describe the slot ("Campeón", "Sub-campeón", etc.).
  label?: string;
}

const STYLE: Record<1 | 2 | 3, { bg: string; ring: string; height: string; label: string }> = {
  1: { bg: "bg-gold/20",   ring: "ring-gold",   height: "h-44", label: "1°" },
  2: { bg: "bg-silver/30", ring: "ring-silver", height: "h-36", label: "2°" },
  3: { bg: "bg-bronze/20", ring: "ring-bronze", height: "h-32", label: "3°" },
};

const DEFAULT_LABEL: Record<1 | 2 | 3, string> = {
  1: "Campeón",
  2: "Sub-campeón",
  3: "Tercer puesto",
};

function PodiumStep({
  entry,
  place,
}: {
  entry: PodiumEntry | undefined;
  place: 1 | 2 | 3;
}) {
  const s = STYLE[place];
  const hasPlayer = !!entry?.name;
  const displayName = hasPlayer
    ? entry!.name!
    : (entry?.label ?? DEFAULT_LABEL[place]);

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar
        className={cn(
          "size-14 ring-2 ring-offset-2 ring-offset-background",
          hasPlayer ? s.ring : "ring-border",
        )}
      >
        <AvatarFallback
          className={cn(
            "bg-card text-base font-bold",
            !hasPlayer && "text-muted-foreground/60",
          )}
        >
          {hasPlayer ? initials(entry!.name!) : "—"}
        </AvatarFallback>
      </Avatar>
      <p
        className={cn(
          "max-w-[12ch] truncate text-center text-xs font-semibold",
          !hasPlayer && "italic text-muted-foreground",
          entry?.isMe && "text-primary",
        )}
      >
        {displayName}
      </p>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-end rounded-t-xl border border-b-0 px-2 pb-2 pt-3",
          s.bg,
          s.height,
          !hasPlayer && "opacity-70",
        )}
      >
        <div
          className={cn(
            "text-2xl font-extrabold tabular-nums",
            !hasPlayer && "text-muted-foreground/70",
          )}
        >
          {hasPlayer ? (entry!.totalPoints ?? 0) : "—"}
        </div>
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          pts
        </div>
        <div className="mt-2 flex items-center gap-1 text-xl font-extrabold">
          {place === 1 ? (
            <Crown className="size-5 text-gold drop-shadow" />
          ) : (
            <Medal className={cn("size-4", place === 2 ? "text-silver" : "text-bronze")} />
          )}
          <span>{s.label}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Podium of three. Accepts 0-3 entries; missing positions render as
 * placeholders. Used by the dashboard / ranking page (with real player
 * data once a match has finished) and by the landing (with descriptive
 * labels and no player data).
 */
export function Podium({ top }: { top: PodiumEntry[] }) {
  const first = top.find((e) => e.position === 1);
  const second = top.find((e) => e.position === 2);
  const third = top.find((e) => e.position === 3);

  return (
    <div className="grid grid-cols-3 items-end gap-2">
      <PodiumStep entry={second} place={2} />
      <PodiumStep entry={first} place={1} />
      <PodiumStep entry={third} place={3} />
    </div>
  );
}
