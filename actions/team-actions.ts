"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth/require-user";
import { getTeamDetail, type TeamDetail } from "@/lib/teams/get-team-detail";

const slugSchema = z.string().trim().min(1).max(64);

export async function getTeamDetailAction(
  slug: string,
): Promise<TeamDetail | null> {
  await requireUser();
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return null;
  return getTeamDetail(parsed.data);
}
