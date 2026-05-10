import { Trophy } from "lucide-react";
import { BracketCard, type BracketCardData } from "./bracket-card";
import { cn } from "@/lib/utils";

export type BracketMatch = BracketCardData;

// FIFA bracket: split the 16 R32 matches into the half whose winners feed
// SF #101 (left) and SF #102 (right). Order inside each column reflects the
// pairing tree so vertical spacing aligns parents to children.
const LAYOUT = {
  leftR32: [74, 77, 73, 75, 83, 84, 81, 82],
  leftR16: [89, 90, 93, 94],
  leftQF: [97, 98],
  leftSF: 101,
  final: 104,
  third: 103,
  rightSF: 102,
  rightQF: [99, 100],
  rightR16: [91, 92, 95, 96],
  rightR32: [76, 78, 79, 80, 86, 88, 85, 87],
} as const;

const SPAN: Record<1 | 2 | 4 | 8, string> = {
  1: "row-span-1",
  2: "row-span-2",
  4: "row-span-4",
  8: "row-span-8",
};

function ColumnGrid({
  matches,
  span,
  variant = "compact",
}: {
  matches: (BracketMatch | undefined)[];
  span: 1 | 2 | 4 | 8;
  variant?: "compact" | "regular" | "featured";
}) {
  return (
    <div className="grid grid-rows-8 gap-1.5">
      {matches.map((m, i) => (
        <div
          key={m?.id ?? `tbd-${i}`}
          className={cn(SPAN[span], "flex items-center")}
        >
          <div className="w-full">
            <BracketCard match={m} variant={variant} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CenterColumn({
  final,
  third,
}: {
  final: BracketMatch | undefined;
  third: BracketMatch | undefined;
}) {
  return (
    <div className="flex flex-col items-stretch justify-center gap-3">
      <div className="relative flex flex-col items-center gap-1 py-2">
        <span
          aria-hidden
          className="absolute inset-0 -m-4 rounded-full bg-accent/25 blur-2xl"
        />
        <Trophy className="relative size-14 text-gold drop-shadow-[0_0_18px_oklch(from_var(--accent)_l_c_h/0.7)]" />
        <span className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Mundial 2026
        </span>
      </div>
      <div>
        <p className="mb-1.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-accent-foreground">
          ★ Final ★
        </p>
        <BracketCard match={final} variant="featured" />
      </div>
      <div>
        <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Tercer puesto
        </p>
        <BracketCard match={third} variant="compact" />
      </div>
    </div>
  );
}

function StageHeader({ label }: { label: string }) {
  return (
    <div className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
      {label}
    </div>
  );
}

export function Bracket({ matches }: { matches: BracketMatch[] }) {
  const byNum = new Map<number, BracketMatch>();
  for (const m of matches) byNum.set(m.matchNumber, m);
  const get = (n: number) => byNum.get(n);

  return (
    <div className="overflow-x-auto">
      <div className="mx-auto min-w-[1100px] max-w-7xl">
        {/* Stage labels row */}
        <div className="mb-3 grid grid-cols-9 gap-2">
          <StageHeader label="32avos" />
          <StageHeader label="Octavos" />
          <StageHeader label="Cuartos" />
          <StageHeader label="Semi" />
          <StageHeader label="Copa" />
          <StageHeader label="Semi" />
          <StageHeader label="Cuartos" />
          <StageHeader label="Octavos" />
          <StageHeader label="32avos" />
        </div>
        <div className="grid grid-cols-9 items-stretch gap-2">
          <ColumnGrid matches={LAYOUT.leftR32.map(get)} span={1} variant="compact" />
          <ColumnGrid matches={LAYOUT.leftR16.map(get)} span={2} variant="compact" />
          <ColumnGrid matches={LAYOUT.leftQF.map(get)} span={4} variant="regular" />
          <ColumnGrid matches={[get(LAYOUT.leftSF)]} span={8} variant="regular" />
          <CenterColumn
            final={get(LAYOUT.final)}
            third={get(LAYOUT.third)}
          />
          <ColumnGrid matches={[get(LAYOUT.rightSF)]} span={8} variant="regular" />
          <ColumnGrid matches={LAYOUT.rightQF.map(get)} span={4} variant="regular" />
          <ColumnGrid matches={LAYOUT.rightR16.map(get)} span={2} variant="compact" />
          <ColumnGrid matches={LAYOUT.rightR32.map(get)} span={1} variant="compact" />
        </div>
      </div>
    </div>
  );
}
