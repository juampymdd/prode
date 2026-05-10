"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ListChecks,
  Trophy,
  BarChart3,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/partidos", label: "Partidos", icon: ListChecks },
  { href: "/standings", label: "Tablas", icon: BarChart3 },
  { href: "/ranking", label: "Ranking", icon: Trophy },
] as const;

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin
    ? [...ITEMS, { href: "/admin/users", label: "Admin", icon: Shield }]
    : ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden">
      <ul
        className={cn(
          "mx-auto grid max-w-md items-stretch px-1 py-1",
          isAdmin ? "grid-cols-5" : "grid-cols-4",
        )}
      >
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 rounded-md py-2 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "stroke-[2.4]")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
