import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Eager-load + high priority. Use for above-the-fold spots like the navbar. */
  priority?: boolean;
}

// drop-shadow on a transparent PNG follows the actual logo silhouette,
// not its bounding box — gives it a nice "floating" feel against any bg.
const SHADOW =
  "drop-shadow-[0_2px_6px_rgba(0,0,0,0.2)] drop-shadow-[0_8px_24px_rgba(29,78,216,0.25)]";

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <Image
      src="/prode-logo.png"
      alt="Prode 26 — Mundial 2026"
      width={480}
      height={449}
      priority={priority}
      className={cn(
        "h-14 w-auto select-none transition-transform duration-200 hover:scale-105",
        SHADOW,
        className,
      )}
    />
  );
}
