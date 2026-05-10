# Prode 26 — Design System

Documento de referencia visual y de UI del Prode Mundial 2026. Sirve para
mantener coherencia entre pantallas, componentes y nuevas features.

> **Filosofía:** mobile-first, copy en español rioplatense, paleta
> "mundialista" (océano profundo + dorado), tipografía clara con números
> tabulares para resultados.

---

## 1. Paleta de color

Definida en [app/globals.css](app/globals.css) usando **OKLCH** (no HEX/HSL),
expuesta vía CSS custom properties + `@theme inline` para que Tailwind v4
genere las utilidades `bg-*`, `text-*`, `border-*`, etc.

### Colores semánticos

| Token            | Light                       | Uso                                           |
| ---------------- | --------------------------- | --------------------------------------------- |
| `--background`   | `oklch(0.985 0.005 250)`    | Fondo base de la app                          |
| `--foreground`   | `oklch(0.16 0.04 260)`      | Texto principal                               |
| `--card`         | `oklch(1 0 0)`              | Superficies (cards, popovers, dialogs)        |
| `--primary`      | `oklch(0.36 0.18 264)`      | Azul océano profundo — CTAs, hero, branding   |
| `--accent`       | `oklch(0.83 0.16 88)`       | Dorado — podio, highlights, secundarios       |
| `--secondary`    | `oklch(0.96 0.015 90)`      | Arena tibia — superficies suaves              |
| `--muted`        | `oklch(0.96 0.01 250)`      | Subtextos, disabled, fondos sutiles           |
| `--success`      | `oklch(0.62 0.18 150)`      | Partidos finalizados, confirmaciones          |
| `--destructive`  | `oklch(0.58 0.24 25)`       | Errores, acciones peligrosas, EN VIVO         |

### Podio (medallas)

| Token       | Color                       | Uso                |
| ----------- | --------------------------- | ------------------ |
| `--gold`    | `oklch(0.83 0.16 88)`       | 1° puesto, corona  |
| `--silver`  | `oklch(0.78 0.02 240)`      | 2° puesto          |
| `--bronze`  | `oklch(0.65 0.13 50)`       | 3° puesto          |

### Modo oscuro

Activado por la clase `.dark`. Mantiene los mismos slots; el primary se
aclara a `oklch(0.66 0.20 264)` y los borders pasan a alphas blancos
(`oklch(1 0 0 / 12%)`). Las medallas no cambian.

### Cómo usarlos

- Para superficies y texto: clases utilitarias (`bg-primary`,
  `text-muted-foreground`, `border-accent/40`).
- Alphas con slash: `bg-primary/10`, `ring-primary/20`. Preferir esto
  antes que crear shades nuevos.
- Nunca usar HEX hardcodeado en JSX; siempre los tokens.

---

## 2. Tipografía

- **Familia**: Geist Sans (UI) + Geist Mono (código). Cargadas en
  [app/layout.tsx](app/layout.tsx).
- **Features OpenType activas**: `"ss01"`, `"cv11"`.
- **Numérica**: usar `tabular-nums` en cualquier lugar donde haya scores,
  puntos o posiciones (evita saltos visuales al cambiar dígitos).

### Escala recomendada

| Rol                       | Clases                                                |
| ------------------------- | ----------------------------------------------------- |
| Page title (hero)         | `text-2xl sm:text-3xl font-extrabold leading-tight`   |
| Section heading           | `text-lg font-bold`                                   |
| Card title                | `font-semibold leading-tight`                         |
| Resultado de partido      | `text-3xl font-extrabold tabular-nums`                |
| Eyebrow / kicker          | `text-xs font-bold uppercase tracking-[0.2em] opacity-80` |
| Label de campo            | `text-sm font-medium`                                 |
| Texto de apoyo            | `text-sm text-muted-foreground`                       |
| Microtexto / status       | `text-[10px] uppercase tracking-wider`                |

---

## 3. Border radius

Escala definida en `:root` con `--radius: 0.75rem` (12px) como base.

| Token         | Valor    | Uso típico                                  |
| ------------- | -------- | ------------------------------------------- |
| `rounded-sm`  | 0.5rem   | Componentes compactos                       |
| `rounded-md`  | 0.625rem | Botones, inputs, badges                     |
| `rounded-lg`  | 0.75rem  | Cards estándar                              |
| `rounded-xl`  | 1.125rem | Cards de partidos, listas                   |
| `rounded-2xl` | 1.875rem | Dialogs, paneles destacados                 |
| `rounded-3xl` | (custom) | Hero del dashboard                          |

---

## 4. Espaciado y layout

### Containers

- **Max-width**: `max-w-5xl` para el cuerpo de página. `max-w-md` para
  formularios de auth, dialogs.
- **Padding horizontal**: `px-4` mobile, mantiene en desktop dentro del
  container.
- **Padding vertical**: `py-6 md:py-8` por sección de página.

### Ritmo vertical

| Contexto                      | Gap            |
| ----------------------------- | -------------- |
| Entre secciones grandes       | `space-y-8`    |
| Entre bloques dentro de sección | `space-y-3` o `space-y-4` |
| Grids de cards                | `gap-3`        |
| Entre form fields             | `gap-4` / `gap-5` |

### Grids de partidos / acciones

- 1 columna en mobile → `sm:grid-cols-2` → `lg:grid-cols-3`.
- Quick actions del dashboard: `grid gap-3 sm:grid-cols-2`.

### Mobile bottom nav clearance

El `BottomNav` es `fixed inset-x-0 bottom-0` solo en mobile (`md:hidden`).
Layouts con bottom nav agregan `pb-20 md:pb-4` al contenido para que la
última fila no quede tapada.

---

## 5. Background "pitch"

Utility `.pitch-bg` (definida en `globals.css`) que se aplica a layouts
de pantalla completa (`(auth)` y `(dashboard)`):

```
radial-gradient(circle at 20% 0%, primary/0.18, transparent 55%),
radial-gradient(circle at 80% 100%, accent/0.16, transparent 60%),
linear-gradient(180deg, blanco-frío, blanco)
```

Da una atmósfera de "estadio iluminado" sin imágenes pesadas. En dark
mode las alphas suben a 0.30/0.18 sobre fondo oscuro.

Otra utility relacionada: `.flag-blur` (filter `blur(28px) saturate(1.6)
scale(1.4)`), usada como fondo decorativo detrás de banderas en cards de
partido.

---

## 6. Componentes UI base

Viven en [components/ui/](components/ui/) y siguen patrón shadcn/ui
adaptado a Tailwind v4 + tokens propios.

### Button — [components/ui/button.tsx](components/ui/button.tsx)

CVA con variantes y tamaños:

| Variante      | Look                                    |
| ------------- | --------------------------------------- |
| `default`     | `bg-primary text-primary-foreground`    |
| `secondary`   | Arena, hover `/80`                      |
| `outline`     | Borde + bg-background, hover accent     |
| `ghost`       | Sin bg, hover accent                    |
| `success`     | Verde — solo para confirmaciones positivas |
| `destructive` | Rojo — confirmar borrado                |
| `link`        | Solo texto subrayado en hover           |

| Tamaño    | Altura / padding             |
| --------- | ---------------------------- |
| `default` | `h-10 px-4 py-2`             |
| `sm`      | `h-8 px-3 text-xs`           |
| `lg`      | `h-11 px-6 text-base`        |
| `icon`    | `size-10`                    |

Foco: `focus-visible:ring-[3px] ring-ring/50`. Iconos de Lucide se
auto-dimensionan a `size-4` salvo override.

### Card — [components/ui/card.tsx](components/ui/card.tsx)

`rounded-xl border bg-card text-card-foreground shadow-sm`. Header,
Content y Footer usan `px-6` con borders opcionales. Para cards "hero"
preferir `rounded-3xl` + `shadow-xl` + gradient.

### Badge — [components/ui/badge.tsx](components/ui/badge.tsx)

`rounded-md px-2 py-0.5 text-xs`. Usado para estado de partido:

- "● EN VIVO" → `destructive` + `animate-pulse`
- "Finalizado" → `success`
- "Cerrado" → `secondary`
- "Programado" → `outline`

### Dialog — [components/ui/dialog.tsx](components/ui/dialog.tsx)

`rounded-2xl shadow-2xl`, overlay `bg-foreground/40 backdrop-blur-sm`,
`max-w-md`. Animaciones zoom + fade (200ms).

### Input / Label

`h-10 rounded-md border-input bg-transparent px-3`, focus ring 3px,
estado inválido con `aria-invalid` aplica `border-destructive`.

### Otros

- **Avatar**: `rounded-full size-9` por defecto; podio sube a `size-14`
  con `ring-2 ring-offset-2` color medalla.
- **Accordion**: dividers `border-b`, chevron rota 180° en open,
  animaciones 200ms ease-out.
- **NumberStepper**: usado en el form de pronósticos para entradas de
  goles.
- **Toast (Sonner)**: feedback de acciones (login link enviado, error,
  etc.).

---

## 7. Iconografía

**Librería única: [`lucide-react`](https://lucide.dev/)**. No mezclar
con otros sets ni con emojis Unicode dentro de la UI funcional.

Tamaños por contexto:

| Contexto                   | Tamaño        |
| -------------------------- | ------------- |
| Inline en texto / badge    | `size-3`      |
| Botones (default)          | `size-4`      |
| Iconos de bottom-nav       | `size-5` (con `stroke-[2.4]` cuando activo) |
| Headings de sección        | `size-5` / `size-6` |
| Hero                       | `size-6 sm:size-7`  |

Emojis Unicode (👋 🏆) sí están permitidos en **copy festivo del hero**
o headings narrativos, no como reemplazo de iconos funcionales.

---

## 8. Patrones de layout

### Header — [components/layout/header.tsx](components/layout/header.tsx)

`sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md`. Logo a
la izquierda, nav desktop al medio, avatar/menú a la derecha. En mobile
solo se ve logo + avatar.

### Bottom nav — [components/layout/bottom-nav.tsx](components/layout/bottom-nav.tsx)

`fixed inset-x-0 bottom-0 md:hidden border-t bg-background/95
backdrop-blur`. Grid de 4 (o 5 con admin). Texto `text-[11px]
font-medium`, icono `size-5`.

### Auth layout — [app/(auth)/layout.tsx](app/(auth)/layout.tsx)

`pitch-bg` + main centrado, container `max-w-md`. Card como envoltorio.

### Dashboard layout — [app/(dashboard)/layout.tsx](app/(dashboard)/layout.tsx)

`pitch-bg` + Header + main + SiteFooter + BottomNav, todo dentro de
`TeamModalProvider` para que cualquier escudito pueda abrir el modal de
equipo.

### Hero pattern (dashboard)

```
rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary/80
p-6 sm:p-8 shadow-xl text-primary-foreground
```

Sub-elementos del hero usan `bg-white/15 backdrop-blur-sm ring-1
ring-white/20` para sub-cards translúcidos.

---

## 9. Voz y tono

Español rioplatense, voseo, tono cercano y de cancha. Imperativos
energéticos y pertenencia.

### Reglas

- **Voseo siempre**: "tenés", "podés", "mandá", "fijate". No usar "tú".
- **CTAs como verbo en infinitivo o vos**: "Cargar pronósticos", "Ver
  podio", "Mandarme el link".
- **Posesivo cercano**: "Tu pronóstico", "tus puntos", "tu lugar".
- **Errores con razón clara**: no decir "Error 401" — decir "El link
  expiró o ya se usó. Pedí uno nuevo."
- **Celebrar con humor**: "¡Exacto! Sumaste 5 puntos", "El podio está
  vacío" (cuando no hay resultados aún).
- **Fútbol como contexto**: "el prode", "la cancha", "arrancó el
  Mundial". No tecnicismos innecesarios.

### Ejemplos vivos

- Hero: "Hola, {nombre} 👋 — Tu pronóstico, tus puntos, tu lugar en el ranking."
- Login: "Te mandamos un link mágico — sin contraseñas."
- Empty state: "El podio se llena con los primeros resultados."
- Error: "Mandaste demasiados links en poco tiempo. Probá de nuevo en unos minutos."

---

## 10. Motion

Animaciones cortas (≤ 250ms) y con `ease-out`.

| Animación              | Duración / curva     | Uso                           |
| ---------------------- | -------------------- | ----------------------------- |
| `accordion-down/up`    | 200ms ease-out       | Acordeones de grupo           |
| Dialog enter/exit      | zoom-in/out + fade   | Modales                       |
| `animate-pulse`        | (Tailwind default)   | Badge "● EN VIVO"             |
| Hover de card          | `shadow-sm → shadow-md` | Cards de partido           |
| Botón hover            | bg `/80` o `/90`     | Todos los variants            |
| `tick` (custom)        | scale + brightness   | Reservada para confirmaciones |

Evitar transiciones de propiedades que disparen layout (width/height
sin necesidad). Preferir `transform` y `opacity`.

---

## 11. Componentes de dominio

Patrones específicos del prode que conviene reutilizar:

- **MatchCard** — [components/matches/match-card.tsx](components/matches/match-card.tsx):
  card `rounded-2xl` con header (badge de estado + stage), cuerpo
  `grid-cols-[1fr_auto_1fr]` (local · vs · visitante), score
  `text-3xl font-extrabold tabular-nums` y banderas con `.flag-blur`
  como decorado.
- **HypeCountdown** — [components/matches/hype-countdown.tsx](components/matches/hype-countdown.tsx):
  contador grande para próximo kickoff, dentro del hero.
- **Podio** — [components/ranking/podium.tsx](components/ranking/podium.tsx):
  3 escalones (`h-44`/`h-36`/`h-32`) con avatares anillados en
  gold/silver/bronze.
- **PredictionForm** — [components/matches/prediction-form.tsx](components/matches/prediction-form.tsx):
  `NumberStepper` por equipo, submit como Server Action.
- **TeamModalProvider** — [components/teams/team-modal-provider.tsx](components/teams/team-modal-provider.tsx):
  context global; cualquier escudito de equipo se vuelve clickeable y
  abre el detalle en dialog.

---

## 12. Accesibilidad y responsive

- **Contraste**: todos los colores semánticos pasan WCAG AA en sus
  combinaciones default (`primary` sobre `primary-foreground`, etc.).
- **Focus visible**: ring de 3px en todos los interactivos. No quitar.
- **Mobile-first**: clases base = mobile, escalá con `sm:` (640px),
  `md:` (768px), `lg:` (1024px). Probar siempre primero a 375px.
- **Touch targets**: mínimo `h-10` (40px) para botones y links de nav.
- **Selección de texto**: la selección usa primary al 25% (definido en
  `::selection`).

---

## 13. Cómo extender el sistema

1. **Color nuevo** → agregar token en `globals.css` (raíz + `.dark`) y
   exponerlo en `@theme inline`. Nunca hardcodear HEX.
2. **Componente UI nuevo** → en `components/ui/`, seguir patrón shadcn:
   CVA para variantes, `data-slot` por composición, props extiende
   `React.ComponentProps<"...">`.
3. **Variante de Card** → componer con clases utilitarias sobre la Card
   base; no crear "GoldCard" si bastan `rounded-3xl border-accent/40
   shadow-xl`.
4. **Página nueva** → reutilizar `pitch-bg` + container `max-w-5xl
   px-4 py-6 md:py-8` + `space-y-8` para el ritmo.
5. **Copy nuevo** → revisar sección de Voz; en duda, releer en voz alta
   con acento porteño. Si suena "neutro de doblaje", reescribir.

---

_Última actualización: 2026-05-10. Cualquier cambio significativo a
tokens o patrones debería actualizarse acá en el mismo PR._
