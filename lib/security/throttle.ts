import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export type ThrottleScope = "signup" | "magic_link";

export interface ThrottleConfig {
  windowSec: number;
  maxAttempts: number;
}

const DEFAULTS: Record<ThrottleScope, ThrottleConfig> = {
  signup:     { windowSec: 600, maxAttempts: 3 },
  magic_link: { windowSec: 600, maxAttempts: 5 },
};

export interface ThrottleResult {
  allowed: boolean;
  retryAfterSec: number;
}

export async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

// Records an attempt and tells the caller whether to proceed. The check and
// the insert race a bit (two concurrent attempts could each see "below
// limit" and both insert), but the worst case is one extra attempt per
// window — acceptable for an anti-abuse signal.
export async function throttle(
  scope: ThrottleScope,
  ip: string,
  override?: Partial<ThrottleConfig>,
): Promise<ThrottleResult> {
  const cfg = { ...DEFAULTS[scope], ...(override ?? {}) };

  if (!ip || ip === "unknown") {
    // No reliable IP → don't block legitimate users; let Supabase's own
    // quota be the safety net.
    return { allowed: true, retryAfterSec: 0 };
  }

  const admin = createAdminClient();
  const sinceIso = new Date(Date.now() - cfg.windowSec * 1000).toISOString();

  const { count, error } = await admin
    .from("auth_throttle")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("ip", ip)
    .gt("created_at", sinceIso);

  if (error) {
    console.error("[throttle] count failed", { scope, code: error.code });
    return { allowed: true, retryAfterSec: 0 };
  }

  if ((count ?? 0) >= cfg.maxAttempts) {
    return { allowed: false, retryAfterSec: cfg.windowSec };
  }

  await admin.from("auth_throttle").insert({ scope, ip });

  // Best-effort cleanup; fire-and-forget so a slow delete never blocks the
  // critical path.
  void admin
    .from("auth_throttle")
    .delete()
    .lt("created_at", sinceIso)
    .then(() => undefined);

  return { allowed: true, retryAfterSec: 0 };
}
