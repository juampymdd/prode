import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteFooter } from "@/components/layout/site-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pitch-bg flex min-h-svh flex-col">
      <header className="px-6 py-5">
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label="Prode 26 — inicio"
        >
          <BrandLogo priority />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
