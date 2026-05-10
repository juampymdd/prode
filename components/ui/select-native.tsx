import * as React from "react";
import { cn } from "@/lib/utils";

function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { NativeSelect };
