-- 02_profiles_table.sql
-- Profiles table linked to auth.users

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('student','cleaner','moderator','admin','superadmin')),
  floor text,
  room text,
  is_active boolean default true,
  deactivated_at timestamptz,
  deactivated_by uuid references public.profiles(id),
  promoted_by uuid references public.profiles(id),
  promoted_at timestamptz,
  external_id text,
  created_at timestamptz default now()
);

-- Trigger to automatically populate profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    email,
    role,
    floor,
    room,
    is_active
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'floor',
    new.raw_user_meta_data->>'room',
    true
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = coalesce(excluded.role, public.profiles.role),
    floor = coalesce(excluded.floor, public.profiles.floor),
    room = coalesce(excluded.room, public.profiles.room);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
