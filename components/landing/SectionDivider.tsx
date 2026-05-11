import { cn } from "@/lib/utils";

interface SectionDividerProps {
  /**
   * Color that the curve "comes from". Should match the bottom of the
   * section above. Defaults to `bg-primary` for hero → light transitions.
   */
  from?: string;
  /**
   * Color the curve "fades into". Matches the section below. Defaults to
   * `currentColor` so a parent text color can drive it.
   */
  className?: string;
  /**
   * "down" (default) curves the top edge of the next section, leaving the
   * "from" color filling the top half. "up" flips it.
   */
  variant?: "down" | "up";
}

/**
 * Soft curved divider between landing sections. Avoids the hard horizontal
 * line you get with abrupt background changes. Two waves at different
 * opacities for a subtle parallax-y look.
 */
export function SectionDivider({
  from = "text-primary",
  className,
  variant = "down",
}: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative -mt-px h-12 w-full overflow-hidden sm:h-16",
        from,
        className,
      )}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={cn(
          "absolute inset-0 h-full w-full",
          variant === "up" && "rotate-180",
        )}
        fill="currentColor"
      >
        <path
          d="M0,32 C240,80 480,80 720,48 C960,16 1200,16 1440,40 L1440,0 L0,0 Z"
          opacity="0.6"
        />
        <path d="M0,0 C240,56 480,56 720,24 C960,-8 1200,-8 1440,16 L1440,0 L0,0 Z" />
      </svg>
    </div>
  );
}
