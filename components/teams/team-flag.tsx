import { cn } from "@/lib/utils";

interface TeamFlagProps {
  url: string | null | undefined;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: boolean;
}

const SIZE: Record<NonNullable<TeamFlagProps["size"]>, string> = {
  sm: "size-5",
  md: "size-7",
  lg: "size-10",
  xl: "size-14",
};

export function TeamFlag({
  url,
  alt,
  size = "md",
  className,
  rounded = false,
}: TeamFlagProps) {
  const wrapper = cn(
    "inline-block shrink-0 overflow-hidden border bg-muted align-middle ring-1 ring-black/5",
    SIZE[size],
    rounded ? "rounded-full" : "rounded-sm",
    className,
  );

  if (!url) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          wrapper,
          "flex items-center justify-center text-[10px] font-semibold text-muted-foreground",
        )}
      >
        ?
      </span>
    );
  }

  return (
    <span className={wrapper}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </span>
  );
}
