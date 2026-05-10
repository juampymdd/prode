-- Knockout schema bits + the full bracket seeded with placeholder labels.
-- A knockout match is identified by:
--   - stage in ('Round of 32','Round of 16','Quarter-final','Semi-final',
--               'Match for third place','Final')
--   - match_number (uniquely numbered 73..104 per the FIFA fixture)
--   - home_label / away_label hold the placeholder ("1A", "2B", "W73", "L101")
--     until the admin assigns real teams via home_team_id / away_team_id.

alter table public.matches
  add column if not exists home_label text,
  add column if not exists away_label text,
  add column if not exists match_number int;

-- Plain unique constraint so ON CONFLICT can target it.
-- Postgres treats multiple NULLs as distinct in unique constraints, so
-- group-stage rows (match_number is null) are unaffected.
alter table public.matches
  drop constraint if exists matches_match_number_key;
alter table public.matches
  add constraint matches_match_number_key unique (match_number);

-- ============================================================================
-- Seed knockout matches (idempotent via match_number).
-- ============================================================================

insert into public.matches
  (match_number, stage, starts_at, status, home_label, away_label)
values
  -- Round of 32 (16 matches)
  (73,  'Round of 32',          timestamptz '2026-06-28 12:00:00-07', 'scheduled', '2A',  '2B'),
  (74,  'Round of 32',          timestamptz '2026-06-29 16:30:00-04', 'scheduled', '1E',  '3A/B/C/D/F'),
  (75,  'Round of 32',          timestamptz '2026-06-29 19:00:00-06', 'scheduled', '1F',  '2C'),
  (76,  'Round of 32',          timestamptz '2026-06-29 12:00:00-05', 'scheduled', '1C',  '2F'),
  (77,  'Round of 32',          timestamptz '2026-06-30 17:00:00-04', 'scheduled', '1I',  '3C/D/F/G/H'),
  (78,  'Round of 32',          timestamptz '2026-06-30 12:00:00-05', 'scheduled', '2E',  '2I'),
  (79,  'Round of 32',          timestamptz '2026-06-30 19:00:00-06', 'scheduled', '1A',  '3C/E/F/H/I'),
  (80,  'Round of 32',          timestamptz '2026-07-01 12:00:00-04', 'scheduled', '1L',  '3E/H/I/J/K'),
  (81,  'Round of 32',          timestamptz '2026-07-01 17:00:00-07', 'scheduled', '1D',  '3B/E/F/I/J'),
  (82,  'Round of 32',          timestamptz '2026-07-01 13:00:00-07', 'scheduled', '1G',  '3A/E/H/I/J'),
  (83,  'Round of 32',          timestamptz '2026-07-02 19:00:00-04', 'scheduled', '2K',  '2L'),
  (84,  'Round of 32',          timestamptz '2026-07-02 12:00:00-07', 'scheduled', '1H',  '2J'),
  (85,  'Round of 32',          timestamptz '2026-07-02 20:00:00-07', 'scheduled', '1B',  '3E/F/G/I/J'),
  (86,  'Round of 32',          timestamptz '2026-07-03 18:00:00-04', 'scheduled', '1J',  '2H'),
  (87,  'Round of 32',          timestamptz '2026-07-03 20:30:00-05', 'scheduled', '1K',  '3D/E/I/J/L'),
  (88,  'Round of 32',          timestamptz '2026-07-03 13:00:00-05', 'scheduled', '2D',  '2G'),

  -- Round of 16 (8)
  (89,  'Round of 16',          timestamptz '2026-07-04 17:00:00-04', 'scheduled', 'W74', 'W77'),
  (90,  'Round of 16',          timestamptz '2026-07-04 12:00:00-05', 'scheduled', 'W73', 'W75'),
  (91,  'Round of 16',          timestamptz '2026-07-05 16:00:00-04', 'scheduled', 'W76', 'W78'),
  (92,  'Round of 16',          timestamptz '2026-07-05 18:00:00-06', 'scheduled', 'W79', 'W80'),
  (93,  'Round of 16',          timestamptz '2026-07-06 14:00:00-05', 'scheduled', 'W83', 'W84'),
  (94,  'Round of 16',          timestamptz '2026-07-06 17:00:00-07', 'scheduled', 'W81', 'W82'),
  (95,  'Round of 16',          timestamptz '2026-07-07 12:00:00-04', 'scheduled', 'W86', 'W88'),
  (96,  'Round of 16',          timestamptz '2026-07-07 13:00:00-07', 'scheduled', 'W85', 'W87'),

  -- Quarter-finals (4)
  (97,  'Quarter-final',        timestamptz '2026-07-09 16:00:00-04', 'scheduled', 'W89', 'W90'),
  (98,  'Quarter-final',        timestamptz '2026-07-10 12:00:00-07', 'scheduled', 'W93', 'W94'),
  (99,  'Quarter-final',        timestamptz '2026-07-11 17:00:00-04', 'scheduled', 'W91', 'W92'),
  (100, 'Quarter-final',        timestamptz '2026-07-11 20:00:00-05', 'scheduled', 'W95', 'W96'),

  -- Semi-finals (2)
  (101, 'Semi-final',           timestamptz '2026-07-14 14:00:00-05', 'scheduled', 'W97', 'W98'),
  (102, 'Semi-final',           timestamptz '2026-07-15 15:00:00-04', 'scheduled', 'W99', 'W100'),

  -- 3rd place + Final
  (103, 'Match for third place', timestamptz '2026-07-18 17:00:00-04', 'scheduled', 'L101', 'L102'),
  (104, 'Final',                 timestamptz '2026-07-19 15:00:00-04', 'scheduled', 'W101', 'W102')
on conflict (match_number) do nothing;
