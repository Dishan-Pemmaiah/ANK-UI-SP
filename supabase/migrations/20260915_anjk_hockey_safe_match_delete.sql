-- Apply after 20260914_anjk_hockey_flexible_knockout.sql.
-- Deletes a fixture and its obsolete knockout references in one transaction.
begin;

create or replace function public.hockey_delete_match(p_match_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  doomed public.hockey_matches;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;

  select * into doomed
  from public.hockey_matches
  where id = p_match_id
  for update;
  if not found then raise exception 'Match not found'; end if;

  -- A started downstream fixture must retain the source result it used.
  if exists (
    select 1 from public.hockey_matches
    where id <> doomed.id
      and status in ('Live', 'Completed')
      and (home_source_match_id = doomed.id or away_source_match_id = doomed.id)
  ) then
    raise exception 'This match feeds a live or completed fixture and cannot be deleted';
  end if;

  -- Historical rows use restrictive foreign keys, including inactive rows.
  delete from public.hockey_advancements
  where source_match_id = doomed.id or target_match_id = doomed.id;

  -- Remove planned links that point to the deleted fixture.
  update public.hockey_matches
  set next_match_id = null, next_slot = null, auto_advance = false
  where next_match_id = doomed.id;

  -- Vacate any unstarted slot that expected this fixture's winner.
  update public.hockey_matches
  set home_team_id = null, home_source_match_id = null
  where home_source_match_id = doomed.id
    and status in ('Upcoming', 'Postponed', 'Cancelled');
  update public.hockey_matches
  set away_team_id = null, away_source_match_id = null
  where away_source_match_id = doomed.id
    and status in ('Upcoming', 'Postponed', 'Cancelled');

  delete from public.hockey_matches where id = doomed.id;
  return doomed.id;
end $$;

revoke all on function public.hockey_delete_match(uuid) from public, anon;
grant execute on function public.hockey_delete_match(uuid) to authenticated;
notify pgrst, 'reload schema';

commit;
