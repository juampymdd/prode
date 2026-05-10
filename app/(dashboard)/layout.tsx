import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { TeamModalProvider } from "@/components/teams/team-modal-provider";
import { requireCompletedProfile } from "@/lib/auth/require-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireCompletedProfile();
  const isAdmin = profile?.is_app_admin === true;

  return (
    <TeamModalProvider>
      <div className="pitch-bg flex min-h-svh flex-col">
        <Header />
        <main className="flex-1 pb-8 md:pb-8">{children}</main>
        <SiteFooter className="pb-20 md:pb-4" />
        <BottomNav isAdmin={isAdmin} />
      </div>
    </TeamModalProvider>
  );
}
