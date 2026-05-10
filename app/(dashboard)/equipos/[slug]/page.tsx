import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { getTeamDetail } from "@/lib/teams/get-team-detail";
import { TeamDetailView } from "@/components/teams/team-detail-view";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamDetailPage({ params }: PageProps) {
  await requireUser();
  const { slug } = await params;
  const detail = await getTeamDetail(decodeURIComponent(slug));
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:py-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/partidos">
          <ArrowLeft className="size-4" />
          Volver
        </Link>
      </Button>
      <TeamDetailView detail={detail} />
    </div>
  );
}
