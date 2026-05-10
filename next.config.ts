import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit reads its bundled .afm font metric files via fs at runtime — keep
  // it external so Turbopack doesn't rewrite those paths.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
