import { Crown, Medal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

interface PodiumEntry {
  position: number;
  name: string;
  totalPoints: number;
  exactHits: number;
  isMe?: boolean;
}

const STYLE: Record<1 | 2 | 3, { bg: string; ring: string; height: string; label: string }> = {
  1: { bg: "bg-gold/20",   ring: "ring-gold",   height: "h-44", label: "1°" },
  2: { bg: "bg-silver/30", ring: "ring-silver", height: "h-36", label: "2°" },
  3: { bg: "bg-bronze/20", ring: "ring-bronze", height: "h-32", label: "3°" },
};

function PodiumStep({ entry, place }: { entry: PodiumEntry | undefined; place: 1 | 2 | 3 }) {
  const s = STYLE[place];
  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar
        className={cn(
          "size-14 ring-2 ring-offset-2 ring-offset-background",
          s.ring,
        )}
      >
        <AvatarFallback className="bg-card text-base font-bold">
          {entry ? initials(entry.name) : "?"}
        </AvatarFallback>
      </Avatar>
      <p className="max-w-[10ch] truncate text-center text-xs font-semibold">
        {entry?.name ?? "—"}
      </p>
      <div
        className={cn(
          "flex w-full flex-col items-center justify-end rounded-t-xl border border-b-0 px-2 pb-2 pt-3",
          s.bg,
          s.height,
        )}
      >
        <div className="text-2xl font-extrabold tabular-nums">
          {entry?.totalPoints ?? 0}
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
