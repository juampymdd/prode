"use client";

import dynamic from "next/dynamic";

// Heavy WebGL component — load only on the client.
const FloatingLines = dynamic(
  () => import("./floating-lines/FloatingLines"),
  { ssr: false },
);

// Module-scope constants so the FloatingLines effect deps stay stable
// across re-renders (otherwise the WebGL context tears down each tick).
const LINES_GRADIENT = ["#fef3c7", "#fbbf24", "#ffffff"];
const ENABLED_WAVES: Array<"top" | "middle" | "bottom"> = [
  "top",
  "middle",
  "bottom",
];

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <FloatingLines
        linesGradient={LINES_GRADIENT}
        enabledWaves={ENABLED_WAVES}
        lineCount={6}
        animationSpeed={0.6}
        interactive
        parallax
        parallaxStrength={0.15}
        mixBlendMode="screen"
      />
    </div>
  );
}
