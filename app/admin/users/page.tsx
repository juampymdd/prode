import { Send, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAppAdmin } from "@/lib/auth/require-user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { UsersList, type AdminUserRow } from "@/components/admin/users-list";

interface ProfileRow {
  user_id: string;
  name: string | null;
  is_app_admin: boolean;
  disabled_at: string | null;
  created_at: string;
}

export default async function AdminUsersPage() {
  const caller = await requireAppAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const [{ data: profiles }, { data: authList }] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, name, is_app_admin, disabled_at, created_at")
      .order("created_at", { ascending: true }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const emailByUserId = new Map<string, string>();
  const emailConfirmedAtByUserId = new Map<string, string | null>();
  for (const u of authList?.users ?? []) {
    if (u.email) emailByUserId.set(u.id, u.email);
    emailConfirmedAtByUserId.set(u.id, u.email_confirmed_at ?? null);
  }

  const rows: AdminUserRow[] = ((profiles ?? []) as ProfileRow[]).map((p) => ({
    user_id: p.user_id,
    name: p.name,
    email: emailByUserId.get(p.user_id) ?? null,
    is_app_admin: p.is_app_admin,
    disabled_at: p.disabled_at,
    email_confirmed_at: emailConfirmedAtByUserId.get(p.user_id) ?? null,
    created_at: p.created_at,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight md:text-3xl">
          <Users className="size-6 text-primary md:size-7" aria-hidden />
          Usuarios del prode
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Invitá gente con un magic link. Sin contraseñas: el invitado abre el
          link y queda dentro del prode.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="size-4 text-primary" />
            Nueva invitación
          </CardTitle>
          <CardDescription>
            Le mandamos un email con un link mágico. Asegurate de que el
            destinatario lo abra desde el mismo dispositivo donde quiere usar la
            app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteUserForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Users className="size-5 text-primary" />
          Inscriptos ({rows.length})
        </h2>

        <UsersList users={rows} currentUserId={caller.id} />
      </section>
    </div>
  );
}
