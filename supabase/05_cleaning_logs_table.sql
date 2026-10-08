-- 05_cleaning_logs_table.sql
-- Daily scheduled cleaning proof logs submitted by cleaners

create table if not exists public.cleaning_logs (
  id uuid primary key default gen_random_uuid(),
  cleaner_id uuid references public.profiles(id) on delete cascade,
  division_id uuid references public.divisions(id) on delete cascade,
  floor_code text not null,
  photo_url text not null,
  photo_taken_at timestamptz not null,
  notes text,
  status text not null default 'pending_review' check (status in ('pending_review','approved','rejected','needs_redo')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_remark text,
  created_at timestamptz default now()
);

create index if not exists idx_cleaning_logs_division_created on public.cleaning_logs(division_id, created_at desc);
create index if not exists idx_cleaning_logs_cleaner_created on public.cleaning_logs(cleaner_id, created_at desc);
create index if not exists idx_cleaning_logs_status_created on public.cleaning_logs(status, created_at desc);
create index if not exists idx_cleaning_logs_floor on public.cleaning_logs(floor_code);
