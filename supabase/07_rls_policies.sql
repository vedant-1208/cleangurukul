-- 07_rls_policies.sql
-- Row Level Security (RLS) policies for Shantigram Gurukul

-- Helper functions to get current user's role safely
create or replace function public.current_user_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_superadmin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'superadmin'
  );
$$;

create or replace function public.is_moderator_or_higher()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin', 'superadmin')
  );
$$;

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.floors enable row level security;
alter table public.divisions enable row level security;
alter table public.division_assignments enable row level security;
alter table public.issues enable row level security;
alter table public.cleaning_logs enable row level security;
alter table public.issue_comments enable row level security;
alter table public.cleaning_log_comments enable row level security;
alter table public.student_notices enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings enable row level security;

-- ============================================================
-- 1. PROFILES
-- ============================================================
drop policy if exists "Profiles are viewable by authenticated users or admins" on public.profiles;
create policy "Profiles are viewable by authenticated users or admins"
  on public.profiles for select
  using (
    auth.uid() = id or public.is_admin_or_superadmin() or public.is_moderator_or_higher()
  );

drop policy if exists "Users can update own profile (non-role fields)" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (
    auth.uid() = id or public.is_admin_or_superadmin()
  );

drop policy if exists "Admins and superadmins can manage profiles" on public.profiles;
create policy "Admins and superadmins can manage profiles"
  on public.profiles for all
  using (public.is_admin_or_superadmin());

-- ============================================================
-- 2. FLOORS
-- ============================================================
drop policy if exists "Floors are viewable by everyone" on public.floors;
create policy "Floors are viewable by everyone"
  on public.floors for select
  using (true);

drop policy if exists "Superadmins can manage floors" on public.floors;
create policy "Superadmins can manage floors"
  on public.floors for all
  using (public.is_superadmin());

-- ============================================================
-- 3. DIVISIONS
-- ============================================================
drop policy if exists "Divisions are viewable by everyone" on public.divisions;
create policy "Divisions are viewable by everyone"
  on public.divisions for select
  using (true);

drop policy if exists "Superadmins have full control over divisions" on public.divisions;
create policy "Superadmins have full control over divisions"
  on public.divisions for all
  using (public.is_superadmin());

drop policy if exists "Admins can update division details" on public.divisions;
create policy "Admins can update division details"
  on public.divisions for update
  using (public.is_admin_or_superadmin());

-- ============================================================
-- 4. DIVISION ASSIGNMENTS
-- ============================================================
drop policy if exists "Cleaners can see own assignments" on public.division_assignments;
create policy "Cleaners can see own assignments"
  on public.division_assignments for select
  using (
    cleaner_id = auth.uid() or public.is_moderator_or_higher()
  );

drop policy if exists "Superadmin can manage assignments" on public.division_assignments;
create policy "Superadmin can manage assignments"
  on public.division_assignments for all
  using (public.is_superadmin());

-- ============================================================
-- 5. ISSUES
-- ============================================================
drop policy if exists "Issue access policy" on public.issues;
create policy "Issue access policy"
  on public.issues for select
  using (
    reporter_id = auth.uid()
    or public.is_moderator_or_higher()
    or assigned_to = auth.uid()
    or exists (
      select 1 from public.division_assignments da
      where da.division_id = issues.division_id and da.cleaner_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can create issues" on public.issues;
create policy "Authenticated users can create issues"
  on public.issues for insert
  with check (auth.uid() is not null);

drop policy if exists "Admins, assignees and moderators can update issues" on public.issues;
create policy "Admins, assignees and moderators can update issues"
  on public.issues for update
  using (
    public.is_admin_or_superadmin()
    or public.is_moderator_or_higher()
    or assigned_to = auth.uid()
    or reporter_id = auth.uid()
  );

drop policy if exists "Admins can delete issues" on public.issues;
create policy "Admins can delete issues"
  on public.issues for delete
  using (public.is_admin_or_superadmin());

-- ============================================================
-- 6. CLEANING LOGS
-- ============================================================
drop policy if exists "Cleaning logs select policy" on public.cleaning_logs;
create policy "Cleaning logs select policy"
  on public.cleaning_logs for select
  using (
    cleaner_id = auth.uid()
    or public.is_moderator_or_higher()
  );

drop policy if exists "Cleaners can insert logs" on public.cleaning_logs;
create policy "Cleaners can insert logs"
  on public.cleaning_logs for insert
  with check (auth.uid() = cleaner_id or public.is_admin_or_superadmin());

drop policy if exists "Moderators and admins can update cleaning logs" on public.cleaning_logs;
create policy "Moderators and admins can update cleaning logs"
  on public.cleaning_logs for update
  using (public.is_moderator_or_higher());

-- ============================================================
-- 7. COMMENTS
-- ============================================================
drop policy if exists "Issue comments select policy" on public.issue_comments;
create policy "Issue comments select policy"
  on public.issue_comments for select
  using (
    public.is_moderator_or_higher()
    or (
      visible_to_reporter = true
      and exists (
        select 1 from public.issues i where i.id = issue_id and (i.reporter_id = auth.uid() or i.assigned_to = auth.uid())
      )
    )
  );

drop policy if exists "Authenticated users can insert issue comments" on public.issue_comments;
create policy "Authenticated users can insert issue comments"
  on public.issue_comments for insert
  with check (auth.uid() is not null);

drop policy if exists "Cleaning log comments select policy" on public.cleaning_log_comments;
create policy "Cleaning log comments select policy"
  on public.cleaning_log_comments for select
  using (
    public.is_moderator_or_higher()
    or exists (
      select 1 from public.cleaning_logs cl where cl.id = log_id and cl.cleaner_id = auth.uid()
    )
  );

drop policy if exists "Authenticated users can insert cleaning log comments" on public.cleaning_log_comments;
create policy "Authenticated users can insert cleaning log comments"
  on public.cleaning_log_comments for insert
  with check (auth.uid() is not null);

-- ============================================================
-- 8. NOTICES
-- ============================================================
drop policy if exists "Student notices select policy" on public.student_notices;
create policy "Student notices select policy"
  on public.student_notices for select
  using (
    recipient_id = auth.uid() or sender_id = auth.uid() or public.is_admin_or_superadmin()
  );

drop policy if exists "Admins can send notices" on public.student_notices;
create policy "Admins can send notices"
  on public.student_notices for insert
  with check (public.is_admin_or_superadmin());

drop policy if exists "Recipients can mark notices as read" on public.student_notices;
create policy "Recipients can mark notices as read"
  on public.student_notices for update
  using (recipient_id = auth.uid() or public.is_admin_or_superadmin());

-- ============================================================
-- 9. AUDIT LOG & SETTINGS
-- ============================================================
drop policy if exists "Admins can read audit log" on public.audit_log;
create policy "Admins can read audit log"
  on public.audit_log for select
  using (public.is_admin_or_superadmin());

drop policy if exists "Authenticated users can insert audit log" on public.audit_log;
create policy "Authenticated users can insert audit log"
  on public.audit_log for insert
  with check (auth.uid() is not null);

drop policy if exists "Everyone can read settings" on public.settings;
create policy "Everyone can read settings"
  on public.settings for select
  using (true);

drop policy if exists "Superadmin can manage settings" on public.settings;
create policy "Superadmin can manage settings"
  on public.settings for all
  using (public.is_superadmin());
