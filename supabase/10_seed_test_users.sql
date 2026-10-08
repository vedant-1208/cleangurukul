-- 10_seed_test_users.sql
-- INSTRUCTIONS FOR INITIAL ADMIN / TEST ROLES SETUP
--
-- DO NOT insert rows directly into auth.users, as Supabase manages encryption and auth triggers.
-- 
-- STEP 1:
-- Register test users through the App Signup page (or Supabase Dashboard -> Authentication -> Users):
--   - student@shantigram.org (Role: Student)
--   - cleaner@shantigram.org (Role: Cleaner)
--   - moderator@shantigram.org (Role: Student/Volunteer initially)
--   - admin@shantigram.org (Role: Student/Staff initially)
--   - superadmin@shantigram.org (Role: Student/Staff initially)
--
-- STEP 2:
-- Run the following SQL snippets in Supabase SQL Editor to elevate user privileges:

-- Elevate to Superadmin:
-- update public.profiles
-- set role = 'superadmin'
-- where email = 'superadmin@shantigram.org';

-- Elevate to Admin:
-- update public.profiles
-- set role = 'admin'
-- where email = 'admin@shantigram.org';

-- Elevate to Moderator:
-- update public.profiles
-- set role = 'moderator'
-- where email = 'moderator@shantigram.org';

-- Confirm Cleaner Role:
-- update public.profiles
-- set role = 'cleaner'
-- where email = 'cleaner@shantigram.org';

-- Verify configured roles:
-- select id, email, full_name, role, is_active from public.profiles;
