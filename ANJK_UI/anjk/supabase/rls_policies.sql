-- Supabase RLS policies for ANK content tables.
-- Apply only in Supabase environments where these tables exist.

-- Helper: ensure UUID extension is available.
create extension if not exists "uuid-ossp";

-- Membership and users
alter table if exists public.app_users enable row level security;

drop policy if exists "app_users_select_self_or_admin" on public.app_users;
create policy "app_users_select_self_or_admin"
on public.app_users
for select
using (
  auth.role() = 'service_role'
  or lower(coalesce(role, '')) = 'admin'
  or auth.jwt() ->> 'email' = email
);

drop policy if exists "app_users_insert_admin_only" on public.app_users;
create policy "app_users_insert_admin_only"
on public.app_users
for insert
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "app_users_update_self_or_admin" on public.app_users;
create policy "app_users_update_self_or_admin"
on public.app_users
for update
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
  or auth.jwt() ->> 'email' = email
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
  or auth.jwt() ->> 'email' = email
);

-- Public content tables
alter table if exists public.about_sections enable row level security;
alter table if exists public.committee_members enable row level security;
alter table if exists public.heritage_sections enable row level security;
alter table if exists public.news_items enable row level security;
alter table if exists public.gallery_items enable row level security;
alter table if exists public.achievements enable row level security;
alter table if exists public.sports_categories enable row level security;
alter table if exists public.sports_tournaments enable row level security;
alter table if exists public.live_updates enable row level security;

-- Read policies for all visitors.
drop policy if exists "public_read_about_sections" on public.about_sections;
create policy "public_read_about_sections"
on public.about_sections
for select
using (true);

drop policy if exists "public_read_committee_members" on public.committee_members;
create policy "public_read_committee_members"
on public.committee_members
for select
using (true);

drop policy if exists "public_read_heritage_sections" on public.heritage_sections;
create policy "public_read_heritage_sections"
on public.heritage_sections
for select
using (true);

drop policy if exists "public_read_news_items" on public.news_items;
create policy "public_read_news_items"
on public.news_items
for select
using (true);

drop policy if exists "public_read_gallery_items" on public.gallery_items;
create policy "public_read_gallery_items"
on public.gallery_items
for select
using (true);

drop policy if exists "public_read_achievements" on public.achievements;
create policy "public_read_achievements"
on public.achievements
for select
using (true);

drop policy if exists "public_read_sports_categories" on public.sports_categories;
create policy "public_read_sports_categories"
on public.sports_categories
for select
using (true);

drop policy if exists "public_read_sports_tournaments" on public.sports_tournaments;
create policy "public_read_sports_tournaments"
on public.sports_tournaments
for select
using (true);

drop policy if exists "public_read_live_updates" on public.live_updates;
create policy "public_read_live_updates"
on public.live_updates
for select
using (true);

-- Admin write policies.
drop policy if exists "admin_write_about_sections" on public.about_sections;
create policy "admin_write_about_sections"
on public.about_sections
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_committee_members" on public.committee_members;
create policy "admin_write_committee_members"
on public.committee_members
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_heritage_sections" on public.heritage_sections;
create policy "admin_write_heritage_sections"
on public.heritage_sections
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_news_items" on public.news_items;
create policy "admin_write_news_items"
on public.news_items
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_gallery_items" on public.gallery_items;
create policy "admin_write_gallery_items"
on public.gallery_items
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_achievements" on public.achievements;
create policy "admin_write_achievements"
on public.achievements
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_sports_categories" on public.sports_categories;
create policy "admin_write_sports_categories"
on public.sports_categories
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_sports_tournaments" on public.sports_tournaments;
create policy "admin_write_sports_tournaments"
on public.sports_tournaments
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);

drop policy if exists "admin_write_live_updates" on public.live_updates;
create policy "admin_write_live_updates"
on public.live_updates
for all
using (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
)
with check (
  auth.role() = 'service_role'
  or lower(coalesce(auth.jwt() ->> 'role', '')) = 'admin'
);
