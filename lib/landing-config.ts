/**
 * Landing-page constants. Values come from the project's source of truth:
 * scoring rules mirror lib/scoring/calculate-prediction-points.ts; do not
 * hand-edit them here without updating that file (or vice versa).
 */

export const MUNDIAL_KICKOFF_ISO = "2026-06-11T17:00:00-03:00";

export const PODIUM_POSITIONS = [
  { position: 1, label: "Campeón" },
  { position: 2, label: "Sub-campeón" },
  { position: 3, label: "Tercer puesto" },
] as const;

export interface ScoringRule {
  iconName: "Target" | "Trophy" | "ShieldCheck" | "CheckCircle2";
  title: string;
  points: string;
  perEach?: boolean;
  example: string;
  terminal?: boolean;
}

export const SCORING_RULES: ScoringRule[] = [
  {
    iconName: "Target",
    title: "Resultado exacto",
    points: "5",
    example: "Predijiste 2-1 y el partido terminó 2-1.",
    terminal: true,
  },
  {
    iconName: "Trophy",
    title: "Ganador o empate",
    points: "3",
    example: "Acertás quién gana (o el empate), aunque el marcador sea distinto.",
  },
  {
    iconName: "ShieldCheck",
    title: "Diferencia de gol",
    points: "2",
    example: "Predecís 3-1 y termina 2-0: misma diferencia, sumás.",
  },
];

// Anchors are prefixed with `/` so they keep working from /standings (any
// page that uses LandingNavbar): the link first navigates to `/` and then
// scrolls to the target.
export const NAV_LINKS = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#reglas", label: "Reglas" },
  { href: "/standings", label: "Tablas" },
  { href: "/#podio", label: "Podio" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const FAQ_ITEMS = [
  {
    q: "¿Cuándo arranca el prode?",
    a: "El prode arranca con el primer partido del Mundial: 11 de junio de 2026. Antes de esa fecha podés cargar tus pronósticos para los partidos de la fase de grupos.",
  },
  {
    q: "¿Cómo cargo mis pronósticos?",
    a: "Entrás a la sección Partidos, elegís el partido y ponés cuántos goles hace cada equipo. Podés editarlo todas las veces que quieras hasta el kick-off — una vez que el partido arranca, queda cerrado.",
  },
  {
    q: "¿Qué pasa si suspenden un partido?",
    a: "Si la FIFA reprograma un partido, tu pronóstico sigue válido para la nueva fecha. Si lo cancelan definitivamente, ese partido no suma ni resta para nadie.",
  },
  {
    q: "¿Cómo se calcula el ranking?",
    a: "Sumás puntos por cada partido finalizado según las reglas (resultado exacto, ganador o empate, y diferencia de gol). El ranking ordena por puntos totales.",
  },
  {
    q: "¿Hasta cuándo me puedo sumar?",
    a: "Te podés sumar hasta que arranque el primer partido. Después de eso, ya empezaron a sumarse puntos y la lista queda cerrada.",
  },
  {
    q: "¿Hay algún premio?",
    a: "No, el prode es por la gloria. Lo que está en juego es el bragging right de quedar arriba en el ranking. Nada más.",
  },
] as const;
