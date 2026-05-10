import PDFDocument from "pdfkit";
import {
  LEGAL_INTRO,
  LEGAL_LAST_UPDATED,
  LEGAL_PENDING,
  LEGAL_SECTIONS,
  LEGAL_SUBTITLE,
  LEGAL_TITLE,
  LEGAL_VERSION,
  type LegalParagraph,
  type LegalSection,
} from "@/lib/legal/privacy-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function renderBody(doc: PDFKit.PDFDocument, body: LegalParagraph[]) {
  for (const node of body) {
    if (node.type === "li") {
      doc
        .font("Helvetica")
        .fontSize(10.5)
        .fillColor("#222222")
        .text(`•  ${node.text}`, {
          paragraphGap: 4,
          indent: 12,
          align: "justify",
          lineGap: 2,
        });
    } else {
      doc
        .font("Helvetica")
        .fontSize(10.5)
        .fillColor("#222222")
        .text(node.text, {
          paragraphGap: 6,
          align: "justify",
          lineGap: 2,
        });
    }
  }
}

function renderSection(doc: PDFKit.PDFDocument, section: LegalSection) {
  doc.moveDown(0.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#0a0a0a")
    .text(section.title, { paragraphGap: 6 });
  renderBody(doc, section.body);
}

function buildPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 56, bottom: 64, left: 56, right: 56 },
      info: {
        Title: LEGAL_TITLE,
        Author: LEGAL_SUBTITLE,
        Subject: "Términos y Condiciones y Política de Privacidad",
        Keywords:
          "Prode 2026, Términos, Privacidad, Ley 25.326, AAIP, Argentina",
        CreationDate: new Date(),
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header / cover.
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#888888")
      .text(LEGAL_SUBTITLE.toUpperCase(), { characterSpacing: 2 });
    doc.moveDown(0.4);
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#0a0a0a")
      .text(LEGAL_TITLE);
    doc.moveDown(0.3);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#666666")
      .text(
        `Versión ${LEGAL_VERSION}  ·  Última actualización: ${LEGAL_LAST_UPDATED}`,
      );
    doc.moveDown(1);

    // Decorative rule.
    const ruleY = doc.y;
    doc
      .strokeColor("#dddddd")
      .lineWidth(0.6)
      .moveTo(doc.page.margins.left, ruleY)
      .lineTo(doc.page.width - doc.page.margins.right, ruleY)
      .stroke();
    doc.moveDown(0.8);

    // Intro.
    renderBody(doc, LEGAL_INTRO);

    // Sections.
    for (const section of LEGAL_SECTIONS) {
      renderSection(doc, section);
    }

    // Pending obligations (operator-facing addendum).
    doc.addPage();
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#0a0a0a")
      .text(LEGAL_PENDING.title);
    doc.moveDown(0.3);
    doc
      .font("Helvetica-Oblique")
      .fontSize(9)
      .fillColor("#888888")
      .text(
        "Anexo interno para el equipo del Prode 26. No forma parte del documento publicado al usuario final.",
        { paragraphGap: 8 },
      );
    renderBody(doc, LEGAL_PENDING.body);

    // Footer with page numbers.
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const bottom = doc.page.height - doc.page.margins.bottom + 24;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#999999")
        .text(
          `${LEGAL_SUBTITLE} · v${LEGAL_VERSION}    Página ${i + 1} de ${range.count}`,
          doc.page.margins.left,
          bottom,
          {
            width:
              doc.page.width - doc.page.margins.left - doc.page.margins.right,
            align: "center",
            lineBreak: false,
          },
        );
    }

    doc.end();
  });
}

export async function GET() {
  const pdf = await buildPdf();
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'inline; filename="prode-26-terminos.pdf"',
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}
