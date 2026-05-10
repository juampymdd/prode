"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/landing-config";

export function Faq() {
  return (
    <section
      id="faq"
      className="bg-muted/30 scroll-mt-20"
    >
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            FAQ
          </p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            Preguntas frecuentes
          </h2>
        </header>

        <div className="mt-8 overflow-hidden rounded-2xl border bg-card">
          <Accordion type="single" collapsible className="w-full">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="px-5 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-5 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
