"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Radio } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Subscribes to live changes on the `matches` table and refreshes the
// current route when one arrives. Multiple events landing in quick
// succession are coalesced into a single refresh.
export function StandingsRealtime() {
  const router = useRouter();
  const [pulse, setPulse] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("standings:matches")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          setPulse(true);
          if (refreshTimer.current) clearTimeout(refreshTimer.current);
          refreshTimer.current = setTimeout(() => {
            router.refresh();
            setTimeout(() => setPulse(false), 1200);
          }, 250);
        },
      )
      .subscribe();

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[11px] font-medium text-success"
      aria-live="polite"
    >
      <Radio
        className={`size-3 ${pulse ? "animate-pulse text-destructive" : ""}`}
      />
      {pulse ? "Actualizando…" : "En vivo"}
    </span>
  );
}
