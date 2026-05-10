-- Translate the 48 World Cup team names from English to Spanish
-- (rioplatense usage: "Qatar", "Países Bajos", "RD Congo").
--
-- Identified by FIFA code (3-letter, immutable). Idempotent thanks to the
-- `name <> v.spanish` guard: re-running this migration is a no-op once the
-- translation is in place.

update public.teams t
set name = v.spanish
from (values
  ('MEX', 'México'),
  ('RSA', 'Sudáfrica'),
  ('KOR', 'Corea del Sur'),
  ('CZE', 'República Checa'),
  ('CAN', 'Canadá'),
  ('BIH', 'Bosnia y Herzegovina'),
  ('QAT', 'Qatar'),
  ('SUI', 'Suiza'),
  ('BRA', 'Brasil'),
  ('MAR', 'Marruecos'),
  ('HAI', 'Haití'),
  ('SCO', 'Escocia'),
  ('USA', 'Estados Unidos'),
  ('PAR', 'Paraguay'),
  ('AUS', 'Australia'),
  ('TUR', 'Turquía'),
  ('GER', 'Alemania'),
  ('CUW', 'Curazao'),
  ('CIV', 'Costa de Marfil'),
  ('ECU', 'Ecuador'),
  ('NED', 'Países Bajos'),
  ('JPN', 'Japón'),
  ('SWE', 'Suecia'),
  ('TUN', 'Túnez'),
  ('BEL', 'Bélgica'),
  ('EGY', 'Egipto'),
  ('IRN', 'Irán'),
  ('NZL', 'Nueva Zelanda'),
  ('ESP', 'España'),
  ('CPV', 'Cabo Verde'),
  ('KSA', 'Arabia Saudita'),
  ('URU', 'Uruguay'),
  ('FRA', 'Francia'),
  ('SEN', 'Senegal'),
  ('IRQ', 'Irak'),
  ('NOR', 'Noruega'),
  ('ARG', 'Argentina'),
  ('ALG', 'Argelia'),
  ('AUT', 'Austria'),
  ('JOR', 'Jordania'),
  ('POR', 'Portugal'),
  ('COD', 'RD Congo'),
  ('UZB', 'Uzbekistán'),
  ('COL', 'Colombia'),
  ('ENG', 'Inglaterra'),
  ('CRO', 'Croacia'),
  ('GHA', 'Ghana'),
  ('PAN', 'Panamá')
) as v(code, spanish)
where t.code = v.code
  and t.name <> v.spanish;
