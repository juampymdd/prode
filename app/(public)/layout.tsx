import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { TeamModalProvider } from "@/components/teams/team-modal-provider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamModalProvider>
      <div className="flex min-h-svh flex-col">
        <LandingNavbar />
        <main className="flex-1">{children}</main>
        <LandingFooter />
      </div>
    </TeamModalProvider>
  );
}
