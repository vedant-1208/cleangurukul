-- 09_seed_floors.sql
-- Seed the 13 building floor-zones (Basements B1, B2, and Floors 1 to 11)

insert into public.floors (code, label, sort_order)
values
  ('0','Ground Floor',1)
  ('B2', 'Basement 2 (B2)', 2),
  ('B1', 'Basement 1 (B1)', 3),
  ('1', 'Floor 1', 4),
  ('2', 'Floor 2', 5),
  ('3', 'Floor 3', 6),
  ('4', 'Floor 4', 7),
  ('5', 'Floor 5', 8),
  ('6', 'Floor 6', 9),
  ('7', 'Floor 7', 10),
  ('8', 'Floor 8', 11),
  ('9', 'Floor 9', 12),
  ('10', 'Floor 10', 13),
  ('11', 'Floor 11', 14)
on conflict (code) do update set
  label = excluded.label,
  sort_order = excluded.sort_order;
