# Prode 26 — Mundial 2026

Prode global del Mundial 2026: cada usuario tiene su predicción por partido y compite contra todos los demás del pool. Auth sin contraseña (magic link), fixture pre-cargado, standings y ranking que se recalculan al cargar resultados.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Auth + Postgres + RLS) · Tailwind 4 · shadcn/ui · Zod · Vitest · Bun.

---

## Modelo conceptual

- **Un único pool global**. No hay grupos privados — todos los usuarios juegan al mismo prode y comparten ranking.
- **Auth con magic link**: el usuario ingresa su email, recibe un link, lo abre y queda dentro. Sin contraseñas.
- **Admin único** hardcodeado: `juampymdd@gmail.com`. El trigger `handle_new_user` setea `is_app_admin = true` automáticamente cuando ese email se registra.
- **Admin solo gestiona**: usuarios (manda magic links de invitación) + resultados (carga el score real). El fixture viene seedeado.
- **Predicciones**: cada usuario carga `home_score` / `away_score` antes del kick-off. Tras el kick-off queda cerrada.
- **Resultados → recálculo automático**: al guardar el resultado, el RPC `recalculate_match_points` actualiza puntos/exactos/ganadores de todas las predicciones de ese partido. Los standings de cada grupo del Mundial salen del view `group_standings`, así que se actualizan instantáneamente.

---

## Setup

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **Project Settings → API**: copiá `Project URL` y `anon public key`.
3. **Auth → URL Configuration**: agregá `http://localhost:3000` como Site URL para dev. En producción, agregá tu dominio.
4. **Auth → Providers → Email**: dejá Magic link habilitado. (Como usamos OTP, no hace falta tocar la confirmación de email.)

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Aplicar migrations + seed

Con [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
bunx supabase login            # una sola vez
bunx supabase link --project-ref <YOUR-PROJECT-REF>
bunx supabase db push          # corre 0001_init + 20260508154615_restructure_global_pool
bunx supabase db query --linked --file supabase/seed.sql   # 48 selecciones + 72 partidos de fase de grupos
```

Alternativa sin CLI: pegar el contenido de cada archivo en **Dashboard → SQL Editor → Run**.

### 4. Correr en local

```bash
bun install
bun dev
```

→ http://localhost:3000

La primera vez que entres con `juampymdd@gmail.com`, el trigger te marca como admin. Si vas a usar otro email como admin, editá la línea correspondiente en `supabase/migrations/20260508154615_restructure_global_pool.sql` antes de pushear, o seteá manualmente:

```sql
update public.profiles set is_app_admin = true
 where user_id = (select id from auth.users where email = 'tu@email.com');
```

---

## Scripts

| Script | Acción |
| --- | --- |
| `bun dev` | Servidor de desarrollo (Turbopack). |
| `bun run build` | Build de producción. |
| `bun run start` | Servir el build. |
| `bun run lint` | ESLint. |
| `bun run typecheck` | `tsc --noEmit`. |
| `bun run test` | Vitest (incluye los tests de scoring). |
| `bun run test:watch` | Vitest en modo watch. |

---

## Sistema de puntos

Definido en `lib/scoring/calculate-prediction-points.ts` (TS) y replicado en SQL dentro del RPC `recalculate_match_points`:

- Resultado exacto: **5 pts** (terminal — no se suman extras).
- Ganador correcto / empate correcto: **3 pts**.
- Diferencia de gol correcta: **2 pts**.
- Cada equipo cuyo marcador coincida: **+1 pt**.
- No permite puntos negativos.

> Si tocás las reglas, actualizá ambos lugares.

## Ranking

Orden:

1. Mayor puntaje
2. Mayor cantidad de exactos
3. Mayor cantidad de ganadores correctos
4. Nombre (alfabético, locale `es`)

---

## Estructura

```
app/
  (auth)/login           # form de email → magic link
  auth/callback/route.ts # exchange code → session
  (dashboard)/
    dashboard            # hero + podio + próximos partidos
    matches              # todos los partidos con form de predicción
    ranking              # podio + tabla completa
    standings            # tabla por grupo del Mundial (view SQL)
  admin/
    users                # invitar por magic link + lista de inscriptos
    results              # cargar score y disparar recálculo
actions/
  auth-actions.ts        # signInWithOtp / logout
  prediction-actions.ts  # upsert con time-window enforcement
  result-actions.ts      # save + recalculate
  admin-user-actions.ts  # invite via magic link
components/
  auth/                  # login form
  matches/               # match-card (con bandera grande), match-summary, prediction-form
  ranking/               # podio, ranking-table
  admin/                 # invite-user-form, result-form
  layout/                # header, bottom-nav (mobile), empty-state
  teams/                 # team-flag (svg de flagcdn.com)
  ui/                    # primitivos shadcn
lib/
  supabase/              # client, server, proxy + database.types.ts
  auth/                  # getUser, requireUser, requireAppAdmin
  scoring/               # calculatePredictionPoints + tests
  ranking/               # getGlobalRanking
  standings/             # getGroupStandings (lee del view)
  validations/           # zod schemas (prediction, result)
supabase/
  migrations/0001_init.sql
  migrations/20260508154615_restructure_global_pool.sql
  seed.sql               # 48 selecciones + 72 partidos
proxy.ts                 # auth gate (convención Next 16)
```

---

## Reglas de seguridad reforzadas en el server

- Las Server Actions usan `requireUser` / `requireAppAdmin`.
- Las predicciones se rechazan si:
  - El partido ya empezó (`starts_at <= now`) o no está en estado `scheduled`.
  - El cliente intenta escribir `points`, `exact_hit` o `winner_hit` (RLS bloquea valores ≠ 0/false).
- Los puntos los escribe únicamente el RPC `recalculate_match_points` (SECURITY DEFINER, valida `is_app_admin`).
- `proxy.ts` redirige rutas privadas a `/login?next=...`.

---

## Checklist de QA

| Paso | Cómo probarlo |
| --- | --- |
| Login mágico | `/login` → email → recibís link → click → `/dashboard`. |
| Predicción | `/matches` → cargá `2-1` antes del kick-off. |
| Bloqueo post-kickoff | Cambiá `starts_at` de un partido a una fecha pasada → la card muestra "Predicción cerrada". |
| Cargar resultado (admin) | `/admin/results` → cargá `2-1`. Toast confirma X predicciones recalculadas. |
| Standings se actualizan | `/standings` muestra Grupo X con 1 partido jugado. |
| Ranking se actualiza | `/ranking` ordena por puntos. |
| No-admin no ve `/admin/*` | Login con otro email → `/admin/users` redirige. |
| Invitar usuario | `/admin/users` → email → toast OK → ese email recibe magic link. |

---

## Notas

- Las llaves del Mundial (R32 → Final) **no** vienen en el seed: dependen de qué selecciones avancen. Una iteración futura podría autogenerarlas cuando todos los partidos de fase de grupos queden en `finished`, leyendo de `group_standings` para los top 2 de cada grupo + 8 mejores terceros.
- Las banderas vienen de [flagcdn.com](https://flagcdn.com/) (SVGs, gratis, sin API key).
- `proxy.ts` reemplaza al deprecado `middleware.ts` de Next 15. La función exportada se llama `proxy`.
