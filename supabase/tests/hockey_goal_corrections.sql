-- Run as database owner after the goal-corrections migration. No test data persists.
begin;
create or replace function public.is_admin() returns boolean language sql stable as $$ select true $$;
do $$
declare s uuid; a uuid; b uuid; scorer uuid; wrong_scorer uuid; fixture uuid; goal_id uuid;
  result public.hockey_matches; rejected boolean;
begin
  insert into public.hockey_seasons(slug, name)
    values('goal-test-' || substr(gen_random_uuid()::text, 1, 8), 'Goal correction test') returning id into s;
  insert into public.hockey_teams(season_id, name) values(s, 'A') returning id into a;
  insert into public.hockey_teams(season_id, name) values(s, 'B') returning id into b;
  insert into public.hockey_players(season_id, team_id, name) values(s, a, 'A scorer') returning id into scorer;
  insert into public.hockey_players(season_id, team_id, name) values(s, b, 'B scorer') returning id into wrong_scorer;
  insert into public.hockey_matches(season_id, home_team_id, away_team_id, scheduled_at)
    values(s, a, b, now()) returning id into fixture;
  perform public.hockey_control_match(fixture, 'start');
  result := public.hockey_correct_goal(fixture, 'add', null, a, null);
  select id into goal_id from public.hockey_match_events
    where match_id = fixture and team_id = a and event_type = 'Goal' and not is_voided;
  if result.home_score <> 1 or goal_id is null then raise exception 'Missed goal was not added'; end if;
  rejected := false;
  begin perform public.hockey_correct_goal(fixture, 'assign', goal_id, a, wrong_scorer);
  exception when others then rejected := position('Scorer must belong' in sqlerrm) > 0; end;
  if not rejected then raise exception 'Wrong-team scorer was accepted'; end if;
  perform public.hockey_correct_goal(fixture, 'assign', goal_id, a, scorer);
  if (select player_id from public.hockey_match_events where id = goal_id) is distinct from scorer then
    raise exception 'Scorer correction was not saved';
  end if;
  result := public.hockey_correct_goal(fixture, 'remove', goal_id, a, null);
  if result.home_score <> 0 or not (select is_voided from public.hockey_match_events where id = goal_id) then
    raise exception 'Goal removal did not update score and credit';
  end if;
  rejected := false;
  begin perform public.hockey_correct_goal(fixture, 'remove', goal_id, a, null);
  exception when others then rejected := position('Active goal not found' in sqlerrm) > 0; end;
  if not rejected then raise exception 'Removed goal was corrected twice'; end if;
  perform public.hockey_control_match(fixture, 'end');
  result := public.hockey_correct_result(fixture, 2, 0);
  if result.home_score <> 2 or (select count(*) from public.hockey_match_events
    where match_id = fixture and team_id = a and event_type = 'Goal' and not is_voided) <> 2 then
    raise exception 'Final score correction did not add active goal rows';
  end if;
  result := public.hockey_correct_result(fixture, 1, 0);
  if result.home_score <> 1 or (select count(*) from public.hockey_match_events
    where match_id = fixture and team_id = a and event_type = 'Goal' and not is_voided) <> 1 then
    raise exception 'Final score correction did not remove excess goal credit';
  end if;
end $$;
rollback;
