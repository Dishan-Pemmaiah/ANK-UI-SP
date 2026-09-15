-- Run manually as database owner after the safe-delete and auto-champion migrations.
-- All temporary data and the admin override roll back.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$ select true $$;

do $$
declare s uuid; r uuid; a uuid; b uuid; final_match uuid;
begin
  insert into public.hockey_seasons(slug,name,tournament_format)
  values('champion-test-' || substr(gen_random_uuid()::text,1,8),'Champion test','Knockout') returning id into s;
  insert into public.hockey_rounds(season_id,name,sort_order,is_final)
  values(s,'Final',2,true) returning id into r;
  insert into public.hockey_teams(season_id,name) values(s,'A') returning id into a;
  insert into public.hockey_teams(season_id,name) values(s,'B') returning id into b;
  insert into public.hockey_matches(season_id,round_id,stage,home_team_id,away_team_id,scheduled_at)
  values(s,r,'Knockout',a,b,now()) returning id into final_match;

  perform public.hockey_control_match(final_match,'start');
  perform public.hockey_control_match(final_match,'home_goal',a);
  perform public.hockey_complete_knockout_match(final_match,a,'Normal');
  if (select champion_team_id from public.hockey_seasons where id=s) is distinct from a then
    raise exception 'Final winner was not set as champion';
  end if;

  perform public.hockey_correct_knockout_result(final_match,0,1,b,'Normal');
  if (select champion_team_id from public.hockey_seasons where id=s) is distinct from b then
    raise exception 'Corrected Final winner did not replace champion';
  end if;

  perform public.hockey_delete_match(final_match);
  if (select champion_team_id from public.hockey_seasons where id=s) is not null then
    raise exception 'Deleting the Final did not clear champion';
  end if;
end $$;

rollback;
