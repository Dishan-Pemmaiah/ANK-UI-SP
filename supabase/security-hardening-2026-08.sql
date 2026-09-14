-- ANJK Supabase security hardening (safe to re-run)
-- Purpose: fix advisor warnings like `rls_disabled_in_public` by enabling RLS
-- and applying policies only on tables that already exist.

begin;

create or replace function public.current_user_email()
returns text
language sql
stable
set search_path = public, pg_temp
as $$
  select lower(trim(coalesce(auth.jwt() ->> 'email', '')));
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public."AppUsers" u
    where lower(trim(coalesce(u."Email", ''))) = public.current_user_email()
      and lower(trim(coalesce(u."Role", ''))) = 'admin'
  );
$$;

create or replace function public.table_exists_public(table_name text)
returns boolean
language sql
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = table_exists_public.table_name
  );
$$;

create or replace function public.apply_public_read_admin_write(table_name text)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  read_policy text;
  write_policy text;
begin
  if not public.table_exists_public(table_name) then
    return;
  end if;

  read_policy := format('public read %s', table_name);
  write_policy := format('admin write %s', table_name);

  execute format('alter table public.%I enable row level security', table_name);

  execute format('drop policy if exists %I on public.%I', read_policy, table_name);
  execute format('drop policy if exists %I on public.%I', write_policy, table_name);

  execute format('create policy %I on public.%I for select using (true)', read_policy, table_name);
  execute format(
    'create policy %I on public.%I for all using (public.is_admin()) with check (public.is_admin())',
    write_policy,
    table_name
  );

  execute format('grant select on public.%I to anon, authenticated', table_name);
  execute format('grant insert, update, delete on public.%I to authenticated', table_name);
end;
$$;

-- Prevent exposed API roles from calling helper RPC functions directly.
revoke execute on function public.apply_public_read_admin_write(text) from anon, authenticated;
revoke execute on function public.table_exists_public(text) from anon, authenticated;

-- Keep execute on policy helper function for RLS checks.
grant execute on function public.is_admin() to anon, authenticated;

-- Public content tables used by the app.
select public.apply_public_read_admin_write('AboutSections');
select public.apply_public_read_admin_write('Achievements');
select public.apply_public_read_admin_write('CommitteeMembers');
select public.apply_public_read_admin_write('ContactSettings');
select public.apply_public_read_admin_write('Events');
select public.apply_public_read_admin_write('Fixtures');
select public.apply_public_read_admin_write('GalleryItems');
select public.apply_public_read_admin_write('HallOfFameItems');
select public.apply_public_read_admin_write('HeritageItems');
select public.apply_public_read_admin_write('HomePageContents');
select public.apply_public_read_admin_write('LiveUpdates');
select public.apply_public_read_admin_write('NewsItems');
select public.apply_public_read_admin_write('Players');
select public.apply_public_read_admin_write('PointTableEntries');
select public.apply_public_read_admin_write('SportCategories');
select public.apply_public_read_admin_write('SportTournamentRecords');
select public.apply_public_read_admin_write('SportsTournaments');
select public.apply_public_read_admin_write('Teams');
select public.apply_public_read_admin_write('Villages');

-- EF Core migration history table should not be publicly accessible.
do $$
begin
  if public.table_exists_public('__EFMigrationsHistory') then
    execute 'alter table public."__EFMigrationsHistory" enable row level security';
    execute 'drop policy if exists "deny all __EFMigrationsHistory" on public."__EFMigrationsHistory"';
    execute 'create policy "deny all __EFMigrationsHistory" on public."__EFMigrationsHistory" for all using (false) with check (false)';
    revoke all on public."__EFMigrationsHistory" from anon, authenticated;
  end if;
end $$;

-- AppUsers has tighter rules than public-read tables.
do $$
begin
  if public.table_exists_public('AppUsers') then
    execute 'alter table public."AppUsers" enable row level security';

    execute 'drop policy if exists "own read AppUsers" on public."AppUsers"';
    execute 'drop policy if exists "own insert AppUsers" on public."AppUsers"';
    execute 'drop policy if exists "own update AppUsers" on public."AppUsers"';
    execute 'drop policy if exists "admin all AppUsers" on public."AppUsers"';

    execute 'create policy "own read AppUsers" on public."AppUsers" for select using (lower(trim(coalesce("Email", ''''))) = public.current_user_email())';
    execute 'create policy "own insert AppUsers" on public."AppUsers" for insert with check (lower(trim(coalesce("Email", ''''))) = public.current_user_email())';
    execute 'create policy "own update AppUsers" on public."AppUsers" for update using (lower(trim(coalesce("Email", ''''))) = public.current_user_email()) with check (lower(trim(coalesce("Email", ''''))) = public.current_user_email())';
    execute 'create policy "admin all AppUsers" on public."AppUsers" for all using (public.is_admin()) with check (public.is_admin())';

    grant select on public."AppUsers" to authenticated;
    grant insert, update on public."AppUsers" to authenticated;
  end if;
end $$;

-- EventRegistrations: owner insert/read + admin manage.
do $$
begin
  if public.table_exists_public('EventRegistrations') then
    execute 'alter table public."EventRegistrations" enable row level security';

    execute 'drop policy if exists "own and admin read EventRegistrations" on public."EventRegistrations"';
    execute 'drop policy if exists "own insert EventRegistrations" on public."EventRegistrations"';
    execute 'drop policy if exists "admin write EventRegistrations" on public."EventRegistrations"';

    execute $policy$
      create policy "own and admin read EventRegistrations"
      on public."EventRegistrations"
      for select
      using (
        public.is_admin()
        or exists (
          select 1
          from public."AppUsers" u
          where u."Id" = "AppUserId"
            and lower(trim(coalesce(u."Email", ''))) = public.current_user_email()
        )
      )
    $policy$;

    execute $policy$
      create policy "own insert EventRegistrations"
      on public."EventRegistrations"
      for insert
      with check (
        exists (
          select 1
          from public."AppUsers" u
          where u."Id" = "AppUserId"
            and lower(trim(coalesce(u."Email", ''))) = public.current_user_email()
        )
      )
    $policy$;

    execute 'create policy "admin write EventRegistrations" on public."EventRegistrations" for all using (public.is_admin()) with check (public.is_admin())';

    grant select, insert on public."EventRegistrations" to authenticated;
  end if;
end $$;

-- Family members: admin only.
do $$
begin
  if public.table_exists_public('FamilyMembers') then
    execute 'alter table public."FamilyMembers" enable row level security';
    execute 'drop policy if exists "admin all FamilyMembers" on public."FamilyMembers"';
    execute 'create policy "admin all FamilyMembers" on public."FamilyMembers" for all using (public.is_admin()) with check (public.is_admin())';
  end if;
end $$;

grant usage, select on all sequences in schema public to authenticated;

-- Optional verification query after running script:
-- select tablename, rowsecurity from pg_tables where schemaname = 'public' order by tablename;

notify pgrst, 'reload schema';

commit;
