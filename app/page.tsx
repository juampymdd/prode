import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ScoringRules } from "@/components/landing/ScoringRules";
import { Prizes } from "@/components/landing/Prizes";
import { Faq } from "@/components/landing/Faq";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Prode Mundial 2026 — Pronosticá por la gloria",
  description:
    "Prode privado del Mundial 2026. Cargá tus pronósticos, sumá puntos partido a partido y peleá el podio. Por la gloria, nada más.",
  openGraph: {
    title: "Prode Mundial 2026 — Pronosticá por la gloria",
    description:
      "Prode privado del Mundial 2026. Cargá tus pronósticos, sumá puntos partido a partido y peleá el podio. Por la gloria, nada más.",
    type: "website",
    locale: "es_AR",
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorks />
        <ScoringRules />
        <Prizes />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
