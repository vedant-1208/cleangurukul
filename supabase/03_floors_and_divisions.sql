-- 03_floors_and_divisions.sql
-- Floors, Divisions, and Cleaner Division Assignments

create table if not exists public.floors (
  code text primary key,
  label text not null,
  sort_order int not null
);

create table if not exists public.divisions (
  id uuid primary key default gen_random_uuid(),
  floor_code text references public.floors(code) on delete cascade,
  name text not null,
  description text,
  frequency text default 'daily' check (frequency in ('daily','twice_daily','weekly','custom')),
  frequency_notes text,
  is_active boolean default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique (floor_code, name)
);

create table if not exists public.division_assignments (
  id uuid primary key default gen_random_uuid(),
  division_id uuid references public.divisions(id) on delete cascade,
  cleaner_id uuid references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz default now(),
  is_active boolean default true
);

create index if not exists idx_divisions_floor on public.divisions(floor_code);
create index if not exists idx_div_assignments_cleaner on public.division_assignments(cleaner_id);
create index if not exists idx_div_assignments_division on public.division_assignments(division_id);
