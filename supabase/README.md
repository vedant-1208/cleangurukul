# Supabase Database Setup for Shantigram Gurukul

Run the following SQL migration scripts in order within the Supabase SQL Editor:

1. `01_extensions.sql` - Enables the pgcrypto extension.
2. `02_profiles_table.sql` - Creates user profiles and triggers on new auth signup.
3. `03_floors_and_divisions.sql` - Defines building floors, floor divisions, and cleaner assignments.
4. `04_issues_table.sql` - Defines student and staff issue reports table.
5. `05_cleaning_logs_table.sql` - Creates daily scheduled cleaning proof logs.
6. `06_comments_notices_audit.sql` - Creates comment threads, notices, settings, and audit logs.
7. `07_rls_policies.sql` - Enables Row Level Security (RLS) across all tables.
8. `08_triggers.sql` - Automates status resolution and audit logging triggers.
9. `09_seed_floors.sql` - Pre-populates all 13 floor zones (B2, B1, 1..11).
10. `10_seed_test_users.sql` - Guide to promoting test accounts to Superadmin, Admin, and Moderator.
