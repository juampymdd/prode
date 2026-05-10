import Link from "next/link";
import { cn } from "@/lib/utils";

interface SiteFooterProps {
  className?: string;
}

export function SiteFooter({ className }: SiteFooterProps) {
  return (
    <footer
      className={cn(
        "border-t bg-background/60 px-4 py-4 text-center text-xs text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <p>
        Prode Mundial 2026 · hecho por{" "}
        <Link
          href="https://juampymad.com"
          className="font-semibold text-foreground/80 transition-colors hover:text-primary hover:underline"
        >
          juampymad.com
        </Link>
      </p>
    </footer>
  );
}
