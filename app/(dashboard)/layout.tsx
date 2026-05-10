import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getUserWithProfile } from "@/lib/auth/get-user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await getUserWithProfile();
  const isAdmin = profile?.is_app_admin === true;

  return (
    <div className="pitch-bg flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pb-24 md:pb-8">{children}</main>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
