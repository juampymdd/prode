import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LEGAL_INTRO,
  LEGAL_LAST_UPDATED,
  LEGAL_PENDING,
  LEGAL_SECTIONS,
  LEGAL_SUBTITLE,
  LEGAL_TITLE,
  LEGAL_VERSION,
  type LegalParagraph,
} from "@/lib/legal/privacy-policy";

export const metadata = {
  title: `${LEGAL_TITLE} · Prode 26`,
};

function renderBody(body: LegalParagraph[], keyPrefix: string) {
  const items: React.ReactNode[] = [];
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length === 0) return;
    items.push(
      <ul
        key={`${keyPrefix}-ul-${items.length}`}
        className="list-disc space-y-1 pl-5"
      >
        {listBuffer.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  body.forEach((node, i) => {
    if (node.type === "li") {
      listBuffer.push(node.text);
      return;
    }
    flushList();
    items.push(
      <p key={`${keyPrefix}-p-${i}`} className="leading-relaxed">
        {node.text}
      </p>,
    );
  });
  flushList();
  return items;
}

export default function TerminosPage() {
  return (
    <Card className="border-primary/20 shadow-xl">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/onboarding">
              <ChevronLeft className="size-4" />
              Volver
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <a href="/terminos/pdf" download="prode-26-terminos.pdf">
              <Download className="size-4" />
              Descargar PDF
            </a>
          </Button>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {LEGAL_SUBTITLE}
          </p>
          <CardTitle className="text-2xl">{LEGAL_TITLE}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Versión {LEGAL_VERSION} · Última actualización:{" "}
            {LEGAL_LAST_UPDATED}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 text-sm text-muted-foreground">
        <div className="space-y-3">{renderBody(LEGAL_INTRO, "intro")}</div>

        {LEGAL_SECTIONS.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h3 className="text-base font-semibold text-foreground">
              {section.title}
            </h3>
            <div className="space-y-3">
              {renderBody(section.body, `s-${idx}`)}
            </div>
          </section>
        ))}

        <section className="space-y-3 rounded-lg border border-dashed bg-muted/30 p-4">
          <h3 className="text-base font-semibold text-foreground">
            {LEGAL_PENDING.title}
          </h3>
          <p className="text-xs italic">
            Apartado interno para el equipo del Prode 26 — no forma parte del
            documento publicado al usuario final.
          </p>
          <div className="space-y-3">
            {renderBody(LEGAL_PENDING.body, "pending")}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
