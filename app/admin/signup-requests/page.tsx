import { UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import {
  ApproveButton,
  DeleteButton,
  RejectButton,
} from "@/components/admin/signup-request-actions";

type Status = "pending" | "approved" | "rejected";

type Row = {
  id: string;
  email: string;
  name: string;
  birthdate: string;
  terms_accepted_at: string;
  status: Status;
  reject_reason: string | null;
  reviewed_at: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBirthdate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function statusBadge(status: Status) {
  if (status === "pending") return <Badge variant="outline">Pendiente</Badge>;
  if (status === "approved") return <Badge variant="success">Aprobada</Badge>;
  return <Badge variant="destructive">Rechazada</Badge>;
}

export default async function SignupRequestsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signup_requests")
    .select(
      "id, email, name, birthdate, terms_accepted_at, status, reject_reason, reviewed_at, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/signup-requests] query failed", error);
  }

  const rows = (data ?? []) as Row[];
  const pending = rows.filter((r) => r.status === "pending");
  const approved = rows.filter((r) => r.status === "approved");
  const rejected = rows.filter((r) => r.status === "rejected");

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <UserPlus className="size-6 text-primary" aria-hidden />
          Solicitudes de registro
        </h1>
        <p className="text-muted-foreground">
          Aprobá una solicitud para mandarle el magic link y dar de alta la
          cuenta. Rechazada queda bloqueada hasta que la elimines.
        </p>
      </header>

      <Section title={`Pendientes (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState
            title="Sin solicitudes pendientes"
            description="Cuando alguien se sume desde /signup vas a verlo acá."
          />
        ) : (
          <div className="grid gap-3">
            {pending.map((r) => (
              <RequestCard key={r.id} row={r} />
            ))}
          </div>
        )}
      </Section>

      {approved.length > 0 && (
        <Section title={`Aprobadas (${approved.length})`}>
          <div className="grid gap-3">
            {approved.map((r) => (
              <RequestCard key={r.id} row={r} />
            ))}
          </div>
        </Section>
      )}

      {rejected.length > 0 && (
        <Section title={`Rechazadas (${rejected.length})`}>
          <div className="grid gap-3">
            {rejected.map((r) => (
              <RequestCard key={r.id} row={r} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function RequestCard({ row }: { row: Row }) {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 pb-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base">{row.name}</CardTitle>
          <p className="font-mono text-xs text-muted-foreground">{row.email}</p>
        </div>
        {statusBadge(row.status)}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <div>
            <dt className="text-muted-foreground">Nacimiento</dt>
            <dd className="font-medium">{formatBirthdate(row.birthdate)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pidió</dt>
            <dd className="font-medium">{formatDate(row.created_at)}</dd>
          </div>
          {row.reviewed_at && (
            <div>
              <dt className="text-muted-foreground">Revisada</dt>
              <dd className="font-medium">{formatDate(row.reviewed_at)}</dd>
            </div>
          )}
          {row.reject_reason && (
            <div className="col-span-full">
              <dt className="text-muted-foreground">Motivo del rechazo</dt>
              <dd className="font-medium text-destructive">
                {row.reject_reason}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
          {row.status === "pending" && (
            <>
              <ApproveButton id={row.id} email={row.email} />
              <RejectButton id={row.id} />
            </>
          )}
          {row.status === "rejected" && (
            <ApproveButton id={row.id} email={row.email} />
          )}
          <div className="ml-auto">
            <DeleteButton id={row.id} email={row.email} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
