"use client";

import dynamic from "next/dynamic";

// Heavy WebGL — load only on the client to keep the hero's first paint cheap.
const Grainient = dynamic(() => import("./grainient/Grainient"), {
  ssr: false,
});

export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Grainient
        // Brand palette: deep ocean blue ↔ mid-blue ↔ gold accent.
        color1="#0E1A4F"
        color2="#3A5BB8"
        color3="#F2C76A"
        zoom={1.05}
        timeSpeed={0.18}
        warpStrength={1.1}
        warpSpeed={1.4}
        warpAmplitude={45}
        blendSoftness={0.12}
        grainAmount={0.08}
        grainAnimated
        contrast={1.35}
        saturation={1.05}
      />
    </div>
  );
}
