-- Mundial 2026 — fixture oficial de fase de grupos.
-- 48 selecciones + 72 partidos. Las 32 llaves (R32 → Final) se cargan
-- desde /admin/matches cuando se conozcan los rivales que clasifican.
-- Idempotente: re-ejecutable.

-- ============================================================================
-- TEAMS (FIFA code + ISO code para flagcdn.com)
-- flagcdn URL format: https://flagcdn.com/{iso}.svg  (subdivision: gb-eng, gb-sct)
-- ============================================================================

-- Names in Spanish (rioplatense). On conflict we match by `code` so the
-- seed stays idempotent across renames; if you change a team's name later,
-- update it via a migration so existing rows get rewritten.
insert into public.teams (name, code, flag_url) values
  ('México',                 'MEX', 'https://flagcdn.com/mx.svg'),
  ('Sudáfrica',              'RSA', 'https://flagcdn.com/za.svg'),
  ('Corea del Sur',          'KOR', 'https://flagcdn.com/kr.svg'),
  ('República Checa',        'CZE', 'https://flagcdn.com/cz.svg'),
  ('Canadá',                 'CAN', 'https://flagcdn.com/ca.svg'),
  ('Bosnia y Herzegovina',   'BIH', 'https://flagcdn.com/ba.svg'),
  ('Qatar',                  'QAT', 'https://flagcdn.com/qa.svg'),
  ('Suiza',                  'SUI', 'https://flagcdn.com/ch.svg'),
  ('Brasil',                 'BRA', 'https://flagcdn.com/br.svg'),
  ('Marruecos',              'MAR', 'https://flagcdn.com/ma.svg'),
  ('Haití',                  'HAI', 'https://flagcdn.com/ht.svg'),
  ('Escocia',                'SCO', 'https://flagcdn.com/gb-sct.svg'),
  ('Estados Unidos',         'USA', 'https://flagcdn.com/us.svg'),
  ('Paraguay',               'PAR', 'https://flagcdn.com/py.svg'),
  ('Australia',              'AUS', 'https://flagcdn.com/au.svg'),
  ('Turquía',                'TUR', 'https://flagcdn.com/tr.svg'),
  ('Alemania',               'GER', 'https://flagcdn.com/de.svg'),
  ('Curazao',                'CUW', 'https://flagcdn.com/cw.svg'),
  ('Costa de Marfil',        'CIV', 'https://flagcdn.com/ci.svg'),
  ('Ecuador',                'ECU', 'https://flagcdn.com/ec.svg'),
  ('Países Bajos',           'NED', 'https://flagcdn.com/nl.svg'),
  ('Japón',                  'JPN', 'https://flagcdn.com/jp.svg'),
  ('Suecia',                 'SWE', 'https://flagcdn.com/se.svg'),
  ('Túnez',                  'TUN', 'https://flagcdn.com/tn.svg'),
  ('Bélgica',                'BEL', 'https://flagcdn.com/be.svg'),
  ('Egipto',                 'EGY', 'https://flagcdn.com/eg.svg'),
  ('Irán',                   'IRN', 'https://flagcdn.com/ir.svg'),
  ('Nueva Zelanda',          'NZL', 'https://flagcdn.com/nz.svg'),
  ('España',                 'ESP', 'https://flagcdn.com/es.svg'),
  ('Cabo Verde',             'CPV', 'https://flagcdn.com/cv.svg'),
  ('Arabia Saudita',         'KSA', 'https://flagcdn.com/sa.svg'),
  ('Uruguay',                'URU', 'https://flagcdn.com/uy.svg'),
  ('Francia',                'FRA', 'https://flagcdn.com/fr.svg'),
  ('Senegal',                'SEN', 'https://flagcdn.com/sn.svg'),
  ('Irak',                   'IRQ', 'https://flagcdn.com/iq.svg'),
  ('Noruega',                'NOR', 'https://flagcdn.com/no.svg'),
  ('Argentina',              'ARG', 'https://flagcdn.com/ar.svg'),
  ('Argelia',                'ALG', 'https://flagcdn.com/dz.svg'),
  ('Austria',                'AUT', 'https://flagcdn.com/at.svg'),
  ('Jordania',               'JOR', 'https://flagcdn.com/jo.svg'),
  ('Portugal',               'POR', 'https://flagcdn.com/pt.svg'),
  ('RD Congo',               'COD', 'https://flagcdn.com/cd.svg'),
  ('Uzbekistán',             'UZB', 'https://flagcdn.com/uz.svg'),
  ('Colombia',               'COL', 'https://flagcdn.com/co.svg'),
  ('Inglaterra',             'ENG', 'https://flagcdn.com/gb-eng.svg'),
  ('Croacia',                'CRO', 'https://flagcdn.com/hr.svg'),
  ('Ghana',                  'GHA', 'https://flagcdn.com/gh.svg'),
  ('Panamá',                 'PAN', 'https://flagcdn.com/pa.svg')
on conflict (code) where code is not null do update
  set name = excluded.name,
      flag_url = excluded.flag_url;

-- ============================================================================
-- MATCHES — 72 partidos de fase de grupos.
-- Las horas las escribimos con offset local (Postgres las normaliza a UTC).
-- ============================================================================

with t as (
  select code, id from public.teams
)
insert into public.matches (home_team_id, away_team_id, starts_at, stage, group_name, status)
select home.id, away.id, starts_at, 'Fase de grupos', group_name, 'scheduled'
from (values
  -- Group A
  ('MEX', 'RSA', timestamptz '2026-06-11 13:00:00-06', 'A'),
  ('KOR', 'CZE', timestamptz '2026-06-11 20:00:00-06', 'A'),
  ('CZE', 'RSA', timestamptz '2026-06-18 12:00:00-04', 'A'),
  ('MEX', 'KOR', timestamptz '2026-06-18 19:00:00-06', 'A'),
  ('CZE', 'MEX', timestamptz '2026-06-24 19:00:00-06', 'A'),
  ('RSA', 'KOR', timestamptz '2026-06-24 19:00:00-06', 'A'),
  -- Group B
  ('CAN', 'BIH', timestamptz '2026-06-12 15:00:00-04', 'B'),
  ('QAT', 'SUI', timestamptz '2026-06-13 12:00:00-07', 'B'),
  ('SUI', 'BIH', timestamptz '2026-06-18 12:00:00-07', 'B'),
  ('CAN', 'QAT', timestamptz '2026-06-18 15:00:00-07', 'B'),
  ('SUI', 'CAN', timestamptz '2026-06-24 12:00:00-07', 'B'),
  ('BIH', 'QAT', timestamptz '2026-06-24 12:00:00-07', 'B'),
  -- Group C
  ('BRA', 'MAR', timestamptz '2026-06-13 18:00:00-04', 'C'),
  ('HAI', 'SCO', timestamptz '2026-06-13 21:00:00-04', 'C'),
  ('SCO', 'MAR', timestamptz '2026-06-19 18:00:00-04', 'C'),
  ('BRA', 'HAI', timestamptz '2026-06-19 20:30:00-04', 'C'),
  ('SCO', 'BRA', timestamptz '2026-06-24 18:00:00-04', 'C'),
  ('MAR', 'HAI', timestamptz '2026-06-24 18:00:00-04', 'C'),
  -- Group D
  ('USA', 'PAR', timestamptz '2026-06-12 18:00:00-07', 'D'),
  ('AUS', 'TUR', timestamptz '2026-06-13 21:00:00-07', 'D'),
  ('USA', 'AUS', timestamptz '2026-06-19 12:00:00-07', 'D'),
  ('TUR', 'PAR', timestamptz '2026-06-19 20:00:00-07', 'D'),
  ('TUR', 'USA', timestamptz '2026-06-25 19:00:00-07', 'D'),
  ('PAR', 'AUS', timestamptz '2026-06-25 19:00:00-07', 'D'),
  -- Group E
  ('GER', 'CUW', timestamptz '2026-06-14 12:00:00-05', 'E'),
  ('CIV', 'ECU', timestamptz '2026-06-14 19:00:00-04', 'E'),
  ('GER', 'CIV', timestamptz '2026-06-20 16:00:00-04', 'E'),
  ('ECU', 'CUW', timestamptz '2026-06-20 19:00:00-05', 'E'),
  ('CUW', 'CIV', timestamptz '2026-06-25 16:00:00-04', 'E'),
  ('ECU', 'GER', timestamptz '2026-06-25 16:00:00-04', 'E'),
  -- Group F
  ('NED', 'JPN', timestamptz '2026-06-14 15:00:00-05', 'F'),
  ('SWE', 'TUN', timestamptz '2026-06-14 20:00:00-06', 'F'),
  ('NED', 'SWE', timestamptz '2026-06-20 12:00:00-05', 'F'),
  ('TUN', 'JPN', timestamptz '2026-06-20 22:00:00-06', 'F'),
  ('JPN', 'SWE', timestamptz '2026-06-25 18:00:00-05', 'F'),
  ('TUN', 'NED', timestamptz '2026-06-25 18:00:00-05', 'F'),
  -- Group G
  ('BEL', 'EGY', timestamptz '2026-06-15 12:00:00-07', 'G'),
  ('IRN', 'NZL', timestamptz '2026-06-15 18:00:00-07', 'G'),
  ('BEL', 'IRN', timestamptz '2026-06-21 12:00:00-07', 'G'),
  ('NZL', 'EGY', timestamptz '2026-06-21 18:00:00-07', 'G'),
  ('EGY', 'IRN', timestamptz '2026-06-26 20:00:00-07', 'G'),
  ('NZL', 'BEL', timestamptz '2026-06-26 20:00:00-07', 'G'),
  -- Group H
  ('ESP', 'CPV', timestamptz '2026-06-15 12:00:00-04', 'H'),
  ('KSA', 'URU', timestamptz '2026-06-15 18:00:00-04', 'H'),
  ('ESP', 'KSA', timestamptz '2026-06-21 12:00:00-04', 'H'),
  ('URU', 'CPV', timestamptz '2026-06-21 18:00:00-04', 'H'),
  ('CPV', 'KSA', timestamptz '2026-06-26 19:00:00-05', 'H'),
  ('URU', 'ESP', timestamptz '2026-06-26 18:00:00-06', 'H'),
  -- Group I
  ('FRA', 'SEN', timestamptz '2026-06-16 15:00:00-04', 'I'),
  ('IRQ', 'NOR', timestamptz '2026-06-16 18:00:00-04', 'I'),
  ('FRA', 'IRQ', timestamptz '2026-06-22 17:00:00-04', 'I'),
  ('NOR', 'SEN', timestamptz '2026-06-22 20:00:00-04', 'I'),
  ('NOR', 'FRA', timestamptz '2026-06-26 15:00:00-04', 'I'),
  ('SEN', 'IRQ', timestamptz '2026-06-26 15:00:00-04', 'I'),
  -- Group J
  ('ARG', 'ALG', timestamptz '2026-06-16 20:00:00-05', 'J'),
  ('AUT', 'JOR', timestamptz '2026-06-16 21:00:00-07', 'J'),
  ('ARG', 'AUT', timestamptz '2026-06-22 12:00:00-05', 'J'),
  ('JOR', 'ALG', timestamptz '2026-06-22 20:00:00-07', 'J'),
  ('ALG', 'AUT', timestamptz '2026-06-27 21:00:00-05', 'J'),
  ('JOR', 'ARG', timestamptz '2026-06-27 21:00:00-05', 'J'),
  -- Group K
  ('POR', 'COD', timestamptz '2026-06-17 12:00:00-05', 'K'),
  ('UZB', 'COL', timestamptz '2026-06-17 20:00:00-06', 'K'),
  ('POR', 'UZB', timestamptz '2026-06-23 12:00:00-05', 'K'),
  ('COL', 'COD', timestamptz '2026-06-23 20:00:00-06', 'K'),
  ('COL', 'POR', timestamptz '2026-06-27 19:30:00-04', 'K'),
  ('COD', 'UZB', timestamptz '2026-06-27 19:30:00-04', 'K'),
  -- Group L
  ('ENG', 'CRO', timestamptz '2026-06-17 15:00:00-05', 'L'),
  ('GHA', 'PAN', timestamptz '2026-06-17 19:00:00-04', 'L'),
  ('ENG', 'GHA', timestamptz '2026-06-23 16:00:00-04', 'L'),
  ('PAN', 'CRO', timestamptz '2026-06-23 19:00:00-04', 'L'),
  ('PAN', 'ENG', timestamptz '2026-06-27 17:00:00-04', 'L'),
  ('CRO', 'GHA', timestamptz '2026-06-27 17:00:00-04', 'L')
) as data(home_code, away_code, starts_at, group_name)
join t home on home.code = data.home_code
join t away on away.code = data.away_code
where not exists (
  select 1 from public.matches m
  where m.home_team_id = home.id
    and m.away_team_id = away.id
    and m.starts_at = data.starts_at
);
