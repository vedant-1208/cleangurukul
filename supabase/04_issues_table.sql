-- 04_issues_table.sql
-- Issues reported by students, staff, and admins

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_role text not null,
  floor_code text not null,
  division_id uuid references public.divisions(id) on delete set null,
  location_type text not null check (location_type in ('room','corridor','washroom','staircase','common','basement','other')),
  room text,
  description text,
  photo_url text not null,
  photo_taken_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','in_progress','resolved','rejected')),
  priority text not null default 'normal' check (priority in ('low','normal','urgent')),
  assigned_to uuid references public.profiles(id),
  resolution_photo_url text,
  admin_feedback text,
  created_by_admin uuid references public.profiles(id),
  edited_by_admin uuid references public.profiles(id),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create index if not exists idx_issues_floor_status on public.issues(floor_code, status);
create index if not exists idx_issues_status_created on public.issues(status, created_at desc);
create index if not exists idx_issues_assigned_to on public.issues(assigned_to);
create index if not exists idx_issues_reporter on public.issues(reporter_id);
