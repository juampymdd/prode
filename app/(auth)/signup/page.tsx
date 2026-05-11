import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignupForm } from "@/components/signup/signup-form";
import { getUser } from "@/lib/auth/get-user";

export const metadata: Metadata = {
  title: "Sumarme al prode · Mundial 2026",
  description:
    "Pedí sumarte al Prode Mundial 2026. Un admin revisa tu solicitud y, si la aprueba, te llega un mail con el link para entrar.",
};

export default async function SignupPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <Card className="border-border/60 shadow-xl">
      <CardHeader className="space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-extrabold tracking-tight">
          <UserPlus className="size-6 text-primary" aria-hidden />
          Sumarme al prode
        </h1>
        <p className="mx-auto text-sm text-muted-foreground">
          Completá tus datos. Cuando un admin apruebe tu solicitud te
          mandamos un mail con el link para entrar.
        </p>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
