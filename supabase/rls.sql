-- ANJK Supabase Auth + RLS setup
-- Run this script in Supabase SQL Editor.

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public."AppUsers" u
    where u."Email" = public.current_user_email()
      and u."Role" = 'Admin'
  );
$$;

-- Enable RLS on all ANJK tables.
alter table if exists public."AboutSections" enable row level security;
alter table if exists public."Achievements" enable row level security;
alter table if exists public."AppUsers" enable row level security;
alter table if exists public."CommitteeMembers" enable row level security;
alter table if exists public."EventRegistrations" enable row level security;
alter table if exists public."Events" enable row level security;
alter table if exists public."FamilyMembers" enable row level security;
alter table if exists public."Fixtures" enable row level security;
alter table if exists public."GalleryItems" enable row level security;
alter table if exists public."HallOfFameItems" enable row level security;
alter table if exists public."HeritageItems" enable row level security;
alter table if exists public."LiveUpdates" enable row level security;
alter table if exists public."NewsItems" enable row level security;
alter table if exists public."Players" enable row level security;
alter table if exists public."PointTableEntries" enable row level security;
alter table if exists public."SportCategories" enable row level security;
alter table if exists public."SportTournamentRecords" enable row level security;
alter table if exists public."Teams" enable row level security;
alter table if exists public."Villages" enable row level security;

-- Remove existing policies so this script is idempotent.
drop policy if exists "public read AboutSections" on public."AboutSections";
drop policy if exists "admin write AboutSections" on public."AboutSections";
drop policy if exists "public read Achievements" on public."Achievements";
drop policy if exists "admin write Achievements" on public."Achievements";
drop policy if exists "own read AppUsers" on public."AppUsers";
drop policy if exists "own insert AppUsers" on public."AppUsers";
drop policy if exists "own update AppUsers" on public."AppUsers";
drop policy if exists "admin all AppUsers" on public."AppUsers";
drop policy if exists "public read CommitteeMembers" on public."CommitteeMembers";
drop policy if exists "admin write CommitteeMembers" on public."CommitteeMembers";
drop policy if exists "public read Events" on public."Events";
drop policy if exists "admin write Events" on public."Events";
drop policy if exists "own and admin read EventRegistrations" on public."EventRegistrations";
drop policy if exists "own insert EventRegistrations" on public."EventRegistrations";
drop policy if exists "admin write EventRegistrations" on public."EventRegistrations";
drop policy if exists "admin all FamilyMembers" on public."FamilyMembers";
drop policy if exists "public read Fixtures" on public."Fixtures";
drop policy if exists "admin write Fixtures" on public."Fixtures";
drop policy if exists "public read GalleryItems" on public."GalleryItems";
drop policy if exists "admin write GalleryItems" on public."GalleryItems";
drop policy if exists "public read HallOfFameItems" on public."HallOfFameItems";
drop policy if exists "admin write HallOfFameItems" on public."HallOfFameItems";
drop policy if exists "public read HeritageItems" on public."HeritageItems";
drop policy if exists "admin write HeritageItems" on public."HeritageItems";
drop policy if exists "public read LiveUpdates" on public."LiveUpdates";
drop policy if exists "admin write LiveUpdates" on public."LiveUpdates";
drop policy if exists "public read NewsItems" on public."NewsItems";
drop policy if exists "admin write NewsItems" on public."NewsItems";
drop policy if exists "public read Players" on public."Players";
drop policy if exists "admin write Players" on public."Players";
drop policy if exists "public read PointTableEntries" on public."PointTableEntries";
drop policy if exists "admin write PointTableEntries" on public."PointTableEntries";
drop policy if exists "public read SportCategories" on public."SportCategories";
drop policy if exists "admin write SportCategories" on public."SportCategories";
drop policy if exists "public read SportTournamentRecords" on public."SportTournamentRecords";
drop policy if exists "admin write SportTournamentRecords" on public."SportTournamentRecords";
drop policy if exists "public read Teams" on public."Teams";
drop policy if exists "admin write Teams" on public."Teams";
drop policy if exists "public read Villages" on public."Villages";
drop policy if exists "admin write Villages" on public."Villages";

-- AppUsers policies.
create policy "own read AppUsers"
  on public."AppUsers"
  for select
  using ("Email" = public.current_user_email());

create policy "own insert AppUsers"
  on public."AppUsers"
  for insert
  with check ("Email" = public.current_user_email());

create policy "own update AppUsers"
  on public."AppUsers"
  for update
  using ("Email" = public.current_user_email())
  with check ("Email" = public.current_user_email());

create policy "admin all AppUsers"
  on public."AppUsers"
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public read + admin write tables.
create policy "public read AboutSections" on public."AboutSections" for select using (true);
create policy "admin write AboutSections" on public."AboutSections" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Achievements" on public."Achievements" for select using (true);
create policy "admin write Achievements" on public."Achievements" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read CommitteeMembers" on public."CommitteeMembers" for select using (true);
create policy "admin write CommitteeMembers" on public."CommitteeMembers" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Events" on public."Events" for select using (true);
create policy "admin write Events" on public."Events" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Fixtures" on public."Fixtures" for select using (true);
create policy "admin write Fixtures" on public."Fixtures" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read GalleryItems" on public."GalleryItems" for select using (true);
create policy "admin write GalleryItems" on public."GalleryItems" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read HallOfFameItems" on public."HallOfFameItems" for select using (true);
create policy "admin write HallOfFameItems" on public."HallOfFameItems" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read HeritageItems" on public."HeritageItems" for select using (true);
create policy "admin write HeritageItems" on public."HeritageItems" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read LiveUpdates" on public."LiveUpdates" for select using (true);
create policy "admin write LiveUpdates" on public."LiveUpdates" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read NewsItems" on public."NewsItems" for select using (true);
create policy "admin write NewsItems" on public."NewsItems" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Players" on public."Players" for select using (true);
create policy "admin write Players" on public."Players" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read PointTableEntries" on public."PointTableEntries" for select using (true);
create policy "admin write PointTableEntries" on public."PointTableEntries" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read SportCategories" on public."SportCategories" for select using (true);
create policy "admin write SportCategories" on public."SportCategories" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read SportTournamentRecords" on public."SportTournamentRecords" for select using (true);
create policy "admin write SportTournamentRecords" on public."SportTournamentRecords" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Teams" on public."Teams" for select using (true);
create policy "admin write Teams" on public."Teams" for all using (public.is_admin()) with check (public.is_admin());

create policy "public read Villages" on public."Villages" for select using (true);
create policy "admin write Villages" on public."Villages" for all using (public.is_admin()) with check (public.is_admin());

-- Family members are private/admin scoped.
create policy "admin all FamilyMembers"
  on public."FamilyMembers"
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Event registrations: users can register themselves; admins can manage all.
create policy "own and admin read EventRegistrations"
  on public."EventRegistrations"
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from public."AppUsers" u
      where u."Id" = "AppUserId"
        and u."Email" = public.current_user_email()
    )
  );

create policy "own insert EventRegistrations"
  on public."EventRegistrations"
  for insert
  with check (
    exists (
      select 1
      from public."AppUsers" u
      where u."Id" = "AppUserId"
        and u."Email" = public.current_user_email()
    )
  );

create policy "admin write EventRegistrations"
  on public."EventRegistrations"
  for all
  using (public.is_admin())
  with check (public.is_admin());
