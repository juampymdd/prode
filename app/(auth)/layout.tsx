import Link from "next/link";
import { Trophy } from "lucide-react";

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
          className="inline-flex items-center gap-2 font-bold tracking-tight"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Trophy className="size-4" />
            <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent" />
          </span>
          Prode 26
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
