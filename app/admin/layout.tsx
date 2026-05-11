import Link from "next/link";
import { ChevronLeft, Flag, Shield, UserPlus, Users } from "lucide-react";
import { requireAppAdmin } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { TeamModalProvider } from "@/components/teams/team-modal-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAppAdmin();

  const supabase = await createClient();
  const { count: pendingRaw } = await supabase
    .from("signup_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  const pendingCount = pendingRaw ?? 0;

  return (
    <TeamModalProvider>
      <div className="pitch-bg flex min-h-svh flex-col">
        <Header />
        <main className="flex-1 pb-12">
          <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 md:py-8">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card/80 p-2 backdrop-blur">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ChevronLeft className="size-4" />
                  Volver
                </Link>
              </Button>
              <span className="hidden text-xs font-bold uppercase tracking-wider text-muted-foreground sm:inline">
                <Shield className="mr-1 inline size-3" />
                Admin
              </span>
              <span className="ml-auto flex flex-wrap items-center gap-1">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/admin/signup-requests">
                    <UserPlus className="size-4" />
                    Solicitudes
                    {pendingCount > 0 && (
                      <span
                        className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold leading-none text-destructive-foreground"
                        aria-label={`${pendingCount} solicitudes pendientes`}
                      >
                        {pendingCount > 99 ? "99+" : pendingCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/admin/users">
                    <Users className="size-4" />
                    Usuarios
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="sm">
                  <Link href="/admin/results">
                    <Flag className="size-4" />
                    Resultados
                  </Link>
                </Button>
              </span>
            </div>
            {children}
          </div>
        </main>
        <SiteFooter />
      </div>
    </TeamModalProvider>
  );
}
