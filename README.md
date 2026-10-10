# Shantigram Gurukul — Cleanliness Management System

A production-ready hostel cleanliness verification and sanitation governance platform built for **Shantigram Gurukul** residential campus.

---

## 🏛️ System Overview

1. **Scheduled Cleaning Proof**: Cleaners upload verified live photos for each assigned division per shift (e.g., Washrooms, Corridors, Dorm Halls).
2. **Student & Staff Issue Reporting**: Residents capture live photos of hygiene concerns; tickets are routed directly to assigned floor cleaners.
3. **Multi-tier Moderation**: Wardens, teachers, and student volunteers inspect photo submissions with *Approve*, *Needs Redo*, or *Reject* actions.
4. **Superadmin Governance**: Full management of the 13 building zones (Basements B1, B2, and Floors 1–11), division assignments, role promotions, and immutable audit logs.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, TailwindCSS
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Row-Level Security, Realtime websockets)
- **Image Processing & Storage**: Cloudinary (unsigned upload preset), browser-image-compression, exifr (live photo timestamp validation)
- **Data & Charts**: Lucide Icons, Recharts, PapaParse (CSV Exports)
- **Deployment**: Netlify

---

## 🔑 Obtaining Environment Keys

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=hostel_issues
VITE_APP_NAME=Shantigram Gurukul Cleanliness
VITE_GURUKUL_SITE_URL=https://shantigramgurukul.org
```

### Where to get each key:

1. **Supabase URL & Anon Key**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard).
   - Create or open your project.
   - Navigate to **Project Settings** → **API**.
   - Copy the **Project URL** into `VITE_SUPABASE_URL`.
   - Copy the `anon` / `public` API key into `VITE_SUPABASE_ANON_KEY`.

2. **Cloudinary Cloud Name & Upload Preset**:
   - Log in to [Cloudinary Console](https://cloudinary.com).
   - Copy your **Cloud Name** into `VITE_CLOUDINARY_CLOUD_NAME`.
   - Navigate to **Settings** (gear icon) → **Upload** → **Upload presets**.
   - Click **Add upload preset**.
   - Set **Signing Mode** to **Unsigned**.
   - Name the preset `hostel_issues` (or match `VITE_CLOUDINARY_UPLOAD_PRESET`).
   - Save the preset.

3. **Netlify Environment Variables**:
   - In your Netlify dashboard → **Site configuration** → **Environment variables**.
   - Add all `VITE_*` keys listed above.

---

## 🗄️ Database Setup (Supabase)

Execute the SQL files located in the `supabase/` folder inside the **Supabase SQL Editor** in numerical order:

1. `01_extensions.sql` — Enables `pgcrypto`.
2. `02_profiles_table.sql` — Profiles table and auth signup trigger.
3. `03_floors_and_divisions.sql` — Floors, divisions, and cleaner assignments.
4. `04_issues_table.sql` — Issue reporting table with composite indexes.
5. `05_cleaning_logs_table.sql` — Cleaning logs and review fields.
6. `06_comments_notices_audit.sql` — Comments, notices, audit trail, and settings.
7. `07_rls_policies.sql` — Enables RLS across all tables.
8. `08_triggers.sql` — Automated audit logs and status timestamp triggers.
9. `09_seed_floors.sql` — Populates the 13 building zones (B2, B1, 1..11).
10. `10_seed_test_users.sql` — Role elevation instructions for test accounts.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start local dev server
npm run dev

# 3. Build for production
npm run build
```

---

