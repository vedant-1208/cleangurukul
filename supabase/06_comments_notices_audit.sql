-- 06_comments_notices_audit.sql
-- Comments, Notices, System Audit Logs, and App Settings

create table if not exists public.issue_comments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references public.issues(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role text not null,
  message text not null,
  visible_to_reporter boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.cleaning_log_comments (
  id uuid primary key default gen_random_uuid(),
  log_id uuid references public.cleaning_logs(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  author_role text not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.student_notices (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text not null,
  action text not null,
  target_table text,
  target_id uuid,
  payload jsonb,
  created_at timestamptz default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz default now()
);

-- Seed default settings
insert into public.settings (key, value)
values
  ('general', '{"app_name": "Shantigram Gurukul Cleanliness", "default_frequency": "daily", "auto_approve_hours": 24}'::jsonb)
on conflict (key) do nothing;

create index if not exists idx_issue_comments_issue on public.issue_comments(issue_id);
create index if not exists idx_cleaning_comments_log on public.cleaning_log_comments(log_id);
create index if not exists idx_notices_recipient on public.student_notices(recipient_id);
create index if not exists idx_audit_log_created on public.audit_log(created_at desc);
