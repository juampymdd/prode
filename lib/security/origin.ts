import { headers } from "next/headers";

// Server-trusted origin for building redirect URLs that go out to third
// parties (Supabase Auth, Resend, etc.). Prefer APP_URL when set so the
// app is robust against Host header injection on self-hosted deployments.
// Falls back to request headers (safe behind Vercel's proxy, which sets
// x-forwarded-host).
export async function trustedOrigin(): Promise<string> {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
