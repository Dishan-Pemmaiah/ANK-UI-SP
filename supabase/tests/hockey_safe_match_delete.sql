-- Run manually as database owner after 20260915_anjk_hockey_safe_match_delete.sql.
-- All temporary records and the admin override roll back.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$ select true $$;

do $$
declare
  s uuid; r uuid; a uuid; b uuid; source uuid; target uuid; advancement uuid;
begin
  insert into public.hockey_seasons(slug,name,tournament_format)
  values('delete-test-' || substr(gen_random_uuid()::text,1,8),'Delete test','Knockout') returning id into s;
  insert into public.hockey_rounds(season_id,name,sort_order) values(s,'Quarter Final',0) returning id into r;
  insert into public.hockey_teams(season_id,name) values(s,'A') returning id into a;
  insert into public.hockey_teams(season_id,name) values(s,'B') returning id into b;
  insert into public.hockey_matches(season_id,round_id,stage,home_team_id,away_team_id,scheduled_at)
  values(s,r,'Knockout',a,b,now()) returning id into source;
  insert into public.hockey_matches(season_id,round_id,stage,scheduled_at,home_source_match_id)
  values(s,r,'Knockout',now(),source) returning id into target;
  update public.hockey_matches set next_match_id=target,next_slot='home' where id=source;
  insert into public.hockey_advancements(season_id,kind,source_match_id,team_id,target_match_id,target_slot,is_active,removed_at)
  values(s,'Winner',source,a,target,'home',false,now()) returning id into advancement;

  perform public.hockey_delete_match(target);

  if exists(select 1 from public.hockey_matches where id=target) then
    raise exception 'Target fixture was not deleted';
  end if;
  if exists(select 1 from public.hockey_advancements where id=advancement) then
    raise exception 'Historical advancement still references deleted fixture';
  end if;
  if exists(select 1 from public.hockey_matches where id=source and next_match_id is not null) then
    raise exception 'Pending source link was not cleared';
  end if;
end $$;

rollback;
