-- Run manually as database owner after the flexible-knockout migration.
-- The admin override and all test records roll back together.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$ select true $$;
do $$
declare s uuid; league uuid; a uuid; b uuid; c uuid; d uuid; foreign_team uuid;
  early uuid; final_round uuid; unused uuid; m1 uuid; m2 uuid; m3 uuid; target uuid; bye_target uuid;
  league_match uuid; advance_id uuid; bye_id uuid; result public.hockey_matches; rejected boolean;
begin
  insert into public.hockey_seasons(slug,name,tournament_format)
    values('knockout-test-' || substr(gen_random_uuid()::text,1,8),'Knockout test','Knockout') returning id into s;
  insert into public.hockey_seasons(slug,name) values('league-test-' || substr(gen_random_uuid()::text,1,8),'League test') returning id into league;
  if (select tournament_format from public.hockey_seasons where id=league) <> 'League' then raise exception 'League default changed'; end if;
  insert into public.hockey_teams(season_id,name) values(s,'A') returning id into a;
  insert into public.hockey_teams(season_id,name) values(s,'B') returning id into b;
  insert into public.hockey_teams(season_id,name) values(s,'C') returning id into c;
  insert into public.hockey_teams(season_id,name) values(s,'D') returning id into d;
  insert into public.hockey_teams(season_id,name) values(league,'Foreign') returning id into foreign_team;
  insert into public.hockey_rounds(season_id,name,sort_order) values(s,'Custom opening',10) returning id into early;
  insert into public.hockey_rounds(season_id,name,sort_order,is_final) values(s,'Custom finish',20,true) returning id into final_round;
  insert into public.hockey_rounds(season_id,name,sort_order) values(s,'Unused',30) returning id into unused;
  update public.hockey_rounds set sort_order=5 where id=early;
  if (select name from public.hockey_rounds where season_id=s order by sort_order limit 1) <> 'Custom opening' then
    raise exception 'Custom round ordering failed'; end if;
  delete from public.hockey_rounds where id=unused;
  insert into public.hockey_matches(season_id,round_id,stage,match_number,home_team_id,away_team_id,scheduled_at)
    values(s,early,'Knockout',10,a,b,now()) returning id into m1;
  insert into public.hockey_matches(season_id,round_id,stage,match_number,home_team_id,away_team_id,scheduled_at)
    values(s,early,'Knockout',11,c,d,now()) returning id into m2;
  insert into public.hockey_matches(season_id,round_id,stage,home_team_id,away_team_id,scheduled_at)
    values(s,early,'Knockout',a,c,now()) returning id into m3;
  insert into public.hockey_matches(season_id,round_id,stage,match_number,scheduled_at)
    values(s,final_round,'Knockout',51,now()) returning id into target;
  insert into public.hockey_matches(season_id,round_id,stage,scheduled_at)
    values(s,final_round,'Knockout',now()) returning id into bye_target;
  if (select home_team_id from public.hockey_matches where id=target) is not null then raise exception 'TBD fixture failed'; end if;
  rejected:=false;
  begin perform public.hockey_control_match(target,'start'); exception when others then rejected:=true; end;
  if not rejected then raise exception 'TBD fixture started'; end if;
  rejected:=false;
  begin update public.hockey_matches set home_team_id=foreign_team where id=target; exception when others then rejected:=true; end;
  if not rejected then raise exception 'Foreign-season participant accepted'; end if;
  rejected:=false;
  begin update public.hockey_matches set home_team_id=a,away_team_id=a where id=target; exception when others then rejected:=true; end;
  if not rejected then raise exception 'Same team on both sides accepted'; end if;
  perform public.hockey_set_progression(m1,target,'home',true);
  if (select home_source_match_id from public.hockey_matches where id=target) <> m1 then
    raise exception 'Winner of source placeholder missing'; end if;
  rejected:=false;
  begin update public.hockey_matches set home_team_id=c where id=target; exception when others then rejected:=true; end;
  if not rejected then raise exception 'An unconfirmed team occupied a reserved winner slot'; end if;
  perform public.hockey_control_match(m1,'start');
  perform public.hockey_control_match(m1,'home_goal',a);
  perform public.hockey_control_match(m1,'home_goal',a);
  perform public.hockey_control_match(m1,'away_goal',b);
  rejected:=false;
  begin perform public.hockey_control_match(m1,'end'); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Knockout ended without winner confirmation'; end if;
  result:=public.hockey_complete_knockout_match(m1,a,'Normal');
  if result.winner_team_id <> a or result.status <> 'Completed' or
    (select home_team_id from public.hockey_matches where id=target) <> a then
    raise exception 'Normal winner did not automatically fill Team A'; end if;
  rejected:=false;
  begin perform public.hockey_set_progression(m2,target,'home',false); exception when others then rejected:=true; end;
  if not rejected or (select home_team_id from public.hockey_matches where id=target) <> a then
    raise exception 'Occupied destination was overwritten'; end if;
  perform public.hockey_control_match(m2,'start');
  perform public.hockey_control_match(m2,'home_goal',c);
  perform public.hockey_control_match(m2,'away_goal',d);
  rejected:=false;
  begin perform public.hockey_complete_knockout_match(m2,c,'Normal'); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Tied normal-time winner accepted'; end if;
  result:=public.hockey_complete_knockout_match(m2,d,'Shootout',3,4);
  if result.winner_team_id <> d or result.shootout_away <> 4 then raise exception 'Shootout winner failed'; end if;
  if (select away_team_id from public.hockey_matches where id=target) is not null then
    raise exception 'Decide-later winner advanced automatically'; end if;
  select id into advance_id from public.hockey_advance_winner(m2,target,'away');
  if (select away_team_id from public.hockey_matches where id=target) <> d then
    raise exception 'Manual winner did not fill Team B'; end if;
  rejected:=false;
  begin perform public.hockey_correct_result(m1,0,1); exception when others then rejected:=true; end;
  if not rejected or (select home_team_id from public.hockey_matches where id=target) <> a then
    raise exception 'Result correction silently corrupted downstream fixture'; end if;
  rejected:=false;
  begin perform public.hockey_correct_knockout_result(m1,1,1,b,'Shootout',3,4);
  exception when others then rejected:=true; end;
  if not rejected then raise exception 'Atomic knockout correction bypassed existing advancement'; end if;
  perform public.hockey_control_match(target,'start');
  rejected:=false;
  begin perform public.hockey_remove_advancement(advance_id); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Started destination advancement was removed'; end if;
  rejected:=false;
  begin perform public.hockey_set_progression(m1,bye_target,'home',false); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Active advancement changed without removal'; end if;
  select id into bye_id from public.hockey_assign_bye(b,bye_target,'home','Bye');
  if (select home_team_id from public.hockey_matches where id=bye_target) <> b then raise exception 'Bye did not fill target'; end if;
  perform public.hockey_remove_advancement(bye_id);
  if (select home_team_id from public.hockey_matches where id=bye_target) is not null or
    (select is_active from public.hockey_advancements where id=bye_id) then raise exception 'Bye removal failed'; end if;
  select id into bye_id from public.hockey_assign_bye(c,bye_target,'away','Direct advance');
  if (select away_team_id from public.hockey_matches where id=bye_target) <> c then raise exception 'Changed bye failed'; end if;
  rejected:=false;
  begin perform public.hockey_assign_bye(foreign_team,bye_target,'home'); exception when others then rejected:=true; end;
  if not rejected then raise exception 'Foreign-season bye accepted'; end if;
  result:=public.hockey_complete_knockout_match(m3,a,'Walkover');
  if result.status <> 'Completed' or result.winner_team_id <> a or result.home_score <> 0 then
    raise exception 'Walkover manufactured a score or failed'; end if;
  result:=public.hockey_set_knockout_winner(m3,c,'Walkover');
  if result.winner_team_id <> c then raise exception 'Manual winner correction failed'; end if;
  result:=public.hockey_correct_knockout_result(m3,1,1,c,'Other');
  if result.home_score <> 1 or result.away_score <> 1 or result.winner_team_id <> c then
    raise exception 'Knockout score and winner correction failed'; end if;

  insert into public.hockey_teams(season_id,name) values(league,'League A') returning id into a;
  insert into public.hockey_teams(season_id,name) values(league,'League B') returning id into b;
  rejected:=false;
  begin insert into public.hockey_matches(season_id,home_team_id,scheduled_at)
    values(league,a,now()); exception when others then rejected:=true; end;
  if not rejected then raise exception 'League TBD fixture accepted'; end if;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at,stage)
    values(league,a,b,now(),'Group') returning id into league_match;
  perform public.hockey_control_match(league_match,'start');
  perform public.hockey_control_match(league_match,'home_goal',a);
  perform public.hockey_control_match(league_match,'end');
  if (select points from public.hockey_standings where team_id=a and season_id=league) <> 3 then
    raise exception 'League points table regressed'; end if;
end $$;
rollback;
