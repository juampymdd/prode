import type { NextConfig } from "next";

// HTTP security headers. CSP ships in Report-Only first so we get telemetry
// from real traffic before flipping to enforcement; the other headers are
// safe to enforce immediately.
//
// Adjust img/connect sources here when adding integrations (Resend webhook,
// analytics, etc.).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Next + Turbopack inject inline boot scripts and use eval for hot
  // module replacement, so both 'unsafe-inline' and 'unsafe-eval' are
  // required until we move to nonces.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://flagcdn.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

const nextConfig: NextConfig = {
  // pdfkit reads its bundled .afm font metric files via fs at runtime — keep
  // it external so Turbopack doesn't rewrite those paths.
  serverExternalPackages: ["pdfkit"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
