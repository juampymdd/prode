import { Podium } from "@/components/ranking/podium";

export function Prizes() {
  return (
    <section
      id="podio"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 md:py-20"
    >
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Podio
        </p>
        <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Por la gloria, nada más
        </h2>
        <p className="mt-3 text-muted-foreground">
          Acá no hay pozo ni premios. Lo que está en juego es el bragging right
          de quedar arriba en el ranking del Mundial.
        </p>
      </header>

      <div className="mx-auto mt-12 max-w-md">
        <Podium top={[]} />
      </div>

      <p className="mx-auto mt-10 max-w-2xl text-balance text-center text-sm text-muted-foreground sm:text-base">
        Al cierre del Mundial, los tres primeros del ranking se quedan con la
        gloria. El resto, con la próxima.
      </p>
    </section>
  );
}
