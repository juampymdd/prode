import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { getUserWithProfile, isProfileComplete } from "@/lib/auth/get-user";

export default async function OnboardingPage() {
  const { user, profile } = await getUserWithProfile();
  if (!user) redirect("/login");
  if (isProfileComplete(profile)) redirect("/dashboard");

  return (
    <Card className="border-primary/20 shadow-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Completá tu perfil</CardTitle>
        <CardDescription>
          Necesitamos algunos datos para sumarte al prode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OnboardingForm
          defaultName={profile?.name ?? ""}
          defaultBirthdate={profile?.birthdate ?? ""}
        />
      </CardContent>
    </Card>
  );
}
