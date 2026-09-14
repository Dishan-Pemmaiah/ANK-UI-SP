-- Run as database owner after all hockey migrations, including the reschedule repair. The transaction rolls back.
-- The temporary is_admin override is visible only within this transaction.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$ select true $$;
do $$
declare s uuid; other_season uuid; a uuid; b uuid; c uuid; other_team uuid; player_a uuid; player_b uuid;
  first_match uuid; second_match uuid; third_match uuid; final_match uuid;
  result public.hockey_matches; goal_id uuid; removed_id uuid; row_a record; row_b record; rejected boolean;
begin
  insert into public.hockey_seasons(slug,name) values('control-test-' || substr(gen_random_uuid()::text,1,8),'Control test') returning id into s;
  insert into public.hockey_teams(season_id,name,pool) values(s,'A','A') returning id into a;
  insert into public.hockey_teams(season_id,name,pool) values(s,'B','A') returning id into b;
  insert into public.hockey_teams(season_id,name,pool) values(s,'C','A') returning id into c;
  insert into public.hockey_seasons(slug,name) values('other-test-' || substr(gen_random_uuid()::text,1,8),'Other season') returning id into other_season;
  insert into public.hockey_teams(season_id,name) values(other_season,'Other') returning id into other_team;
  insert into public.hockey_players(season_id,team_id,name,shirt_number) values(s,a,'A scorer',7) returning id into player_a;
  insert into public.hockey_players(season_id,team_id,name,shirt_number) values(s,b,'B scorer',9) returning id into player_b;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,a,b,now()) returning id into first_match;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,b,c,now()) returning id into second_match;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,a,c,now()) returning id into third_match;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at,stage) values(s,a,b,now(),'Final') returning id into final_match;
  rejected := false;
  begin insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,a,a,now());
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Same-team fixture was accepted'; end if;
  rejected := false;
  begin insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,a,b,null);
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Fixture without date was accepted'; end if;
  rejected := false;
  begin insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at) values(s,a,other_team,now());
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Cross-season team was accepted'; end if;
  rejected := false;
  begin perform public.hockey_control_match(first_match,'home_goal',a);
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Upcoming fixture accepted score change'; end if;
  rejected := false;
  begin update public.hockey_matches set home_score=-1 where id=first_match;
  exception when others then rejected := true; end;
  if not rejected then raise exception 'Negative score was accepted'; end if;

  result := public.hockey_control_match(first_match,'start');
  if result.status <> 'Live' or result.phase <> '1st Half' then raise exception 'Start did not set live first half'; end if;
  rejected := false;
  begin perform public.hockey_control_match(second_match,'start');
  exception when others then rejected := position('Another match is already live' in sqlerrm) > 0; end;
  if not rejected then raise exception 'Second live match was not rejected'; end if;
  rejected := false;
  begin perform public.hockey_control_match(first_match,'home_goal',a,player_b);
  exception when others then rejected := position('Scorer must belong' in sqlerrm) > 0; end;
  if not rejected then raise exception 'Wrong-team scorer was not rejected'; end if;

  result := public.hockey_control_match(first_match,'home_goal',a,player_a);
  if result.home_score <> 1 then raise exception 'Home goal failed'; end if;
  select id into goal_id from public.hockey_match_events where match_id=first_match and event_type='Goal' and player_id=player_a;
  if goal_id is null then raise exception 'Goal scorer was not recorded'; end if;
  result := public.hockey_control_match(first_match,'away_goal',b);
  if result.away_score <> 1 then raise exception 'Quick away goal failed'; end if;
  result := public.hockey_control_match(first_match,'home_undo',a);
  select id into removed_id from public.hockey_match_events where match_id=first_match and event_type='Goal Removed' and reverses_event_id=goal_id;
  if result.home_score <> 0 or removed_id is null or not (select is_voided from public.hockey_match_events where id=goal_id) then
    raise exception 'Undo did not reverse the recorded goal';
  end if;
  result := public.hockey_control_match(first_match,'home_goal',a,player_a);
  result := public.hockey_control_match(first_match,'phase_half');
  if result.phase <> 'Half Time' then raise exception 'Half Time transition failed'; end if;
  result := public.hockey_control_match(first_match,'phase_second');
  if result.phase <> '2nd Half' then raise exception 'Second Half transition failed'; end if;
  result := public.hockey_control_match(first_match,'end');
  if result.status <> 'Completed' or result.phase <> 'Finished' or result.home_score <> 1 or result.away_score <> 1 then
    raise exception 'End Match did not save final draw';
  end if;
  rejected := false;
  begin perform public.hockey_control_match(first_match,'start'); exception when others then rejected := true; end;
  if not rejected then raise exception 'Completed match restarted'; end if;
  rejected := false;
  begin perform public.hockey_control_match(first_match,'away_goal',b); exception when others then rejected := true; end;
  if not rejected then raise exception 'Completed match accepted score change'; end if;
  select * into row_a from public.hockey_standings where season_id=s and team_id=a;
  if row_a.drawn <> 1 or row_a.points <> 1 then raise exception 'Draw standings incorrect'; end if;
  result := public.hockey_correct_result(first_match,2,1);
  select * into row_a from public.hockey_standings where season_id=s and team_id=a;
  select * into row_b from public.hockey_standings where season_id=s and team_id=b;
  if result.home_score <> 2 or row_a.won <> 1 or row_a.goal_difference <> 1 or row_a.points <> 3
     or row_b.lost <> 1 or row_b.goal_difference <> -1 or row_b.points <> 0 then
    raise exception 'Correction did not recalculate win/loss standings';
  end if;

  result := public.hockey_control_match(second_match,'start');
  result := public.hockey_control_match(second_match,'home_goal',b,player_b);
  result := public.hockey_control_match(second_match,'postpone');
  if result.status <> 'Postponed' then raise exception 'Postpone failed'; end if;
  update public.hockey_matches set status='Upcoming', phase='Not Started', home_score=0, away_score=0 where id=second_match;
  if (select home_score from public.hockey_matches where id=second_match) <> 0 then
    raise exception 'Rescheduled fixture score was not reset';
  end if;
  if exists (select 1 from public.hockey_match_events where match_id=second_match and event_type='Goal' and not is_voided) then
    raise exception 'Rescheduled fixture retained old scorer credit';
  end if;
  result := public.hockey_control_match(third_match,'cancel');
  if result.status <> 'Cancelled' then raise exception 'Cancel failed'; end if;
  rejected := false;
  begin perform public.hockey_control_match(third_match,'start'); exception when others then rejected := true; end;
  if not rejected then raise exception 'Cancelled match restarted'; end if;
  update public.hockey_matches set status='Completed', phase='Finished', home_score=5, away_score=0 where id=final_match;
  select * into row_a from public.hockey_standings where season_id=s and team_id=a;
  if row_a.played <> 1 or row_a.points <> 3 then raise exception 'Knockout/postponed/cancelled match entered league table'; end if;
end $$;
rollback;
