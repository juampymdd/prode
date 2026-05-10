"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTeamDetailAction } from "@/actions/team-actions";
import { TeamDetailView } from "@/components/teams/team-detail-view";
import type { TeamDetail } from "@/lib/teams/get-team-detail";

interface TeamModalContextValue {
  open: (slug: string) => void;
}

const TeamModalContext = createContext<TeamModalContextValue | null>(null);

export function useTeamModal() {
  const ctx = useContext(TeamModalContext);
  if (!ctx) {
    throw new Error("useTeamModal must be used within <TeamModalProvider>");
  }
  return ctx;
}

export function TeamModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [slug, setSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((s: string) => {
    setSlug(s);
    setDetail(null);
    setError(null);
    setLoading(true);
  }, []);

  const close = useCallback(() => {
    setSlug(null);
    setDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getTeamDetailAction(slug)
      .then((d) => {
        if (cancelled) return;
        if (!d) {
          setError("No encontramos ese equipo.");
        } else {
          setDetail(d);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setError("No pudimos cargar los partidos del equipo.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const ctx = useMemo<TeamModalContextValue>(() => ({ open }), [open]);

  // Slug used for the "página completa" link (prefer code, fall back to id).
  const pageSlug = detail?.team.code ?? detail?.team.id ?? slug ?? "";

  return (
    <TeamModalContext.Provider value={ctx}>
      {children}
      <Dialog open={slug != null} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detail?.team.name ?? (loading ? "Cargando…" : "Equipo")}
            </DialogTitle>
          </DialogHeader>

          {loading && !detail && (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm">Cargando partidos…</span>
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          {detail && (
            <>
              <TeamDetailView detail={detail} onOpponentClick={open} />
              <div className="flex justify-end pt-2">
                <Button asChild variant="outline" size="sm" onClick={close}>
                  <Link href={`/equipos/${pageSlug}`}>
                    <ExternalLink className="size-4" />
                    Ver página completa
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </TeamModalContext.Provider>
  );
}
