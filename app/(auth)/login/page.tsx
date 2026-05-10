import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <Card className="border-primary/20 shadow-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Bienvenido al Prode 26</CardTitle>
        <CardDescription>
          Ingresá tu email y te mandamos un link mágico para entrar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error === "invalid_link" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            El link expiró o ya se usó. Pedí uno nuevo.
          </div>
        )}
        <LoginForm next={next} />
      </CardContent>
    </Card>
  );
}
