-- Apply after the match-control follow-up and reschedule-history migrations.
-- Keep the score and scorer credit in one transaction for each correction.
begin;

create or replace function public.hockey_correct_goal(
  p_match_id uuid, p_action text, p_goal_id uuid default null,
  p_team_id uuid default null, p_player_id uuid default null
) returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; goal public.hockey_match_events; scoring_team uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id = p_match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if m.status not in ('Live', 'Completed') then raise exception 'Goals can only be corrected for live or completed matches'; end if;
  if p_action not in ('add', 'remove', 'assign') then raise exception 'Invalid goal correction action'; end if;

  if p_action = 'add' then
    if p_goal_id is not null then raise exception 'New goals cannot reference an existing goal'; end if;
    scoring_team := p_team_id;
    if scoring_team is distinct from m.home_team_id and scoring_team is distinct from m.away_team_id then
      raise exception 'Team is not in this match';
    end if;
  else
    select * into goal from public.hockey_match_events
      where id = p_goal_id and match_id = m.id and season_id = m.season_id
        and event_type = 'Goal' and not is_voided for update;
    if not found then raise exception 'Active goal not found'; end if;
    scoring_team := goal.team_id;
    if p_team_id is distinct from scoring_team then raise exception 'Goal team does not match'; end if;
  end if;

  if p_player_id is not null and not exists (
    select 1 from public.hockey_players
      where id = p_player_id and team_id = scoring_team and season_id = m.season_id
  ) then raise exception 'Scorer must belong to the scoring team'; end if;

  if p_action = 'assign' then
    update public.hockey_match_events set player_id = p_player_id where id = goal.id;
  elsif p_action = 'add' then
    if scoring_team = m.home_team_id then
      update public.hockey_matches set home_score = home_score + 1 where id = m.id returning * into m;
    else
      update public.hockey_matches set away_score = away_score + 1 where id = m.id returning * into m;
    end if;
    insert into public.hockey_match_events(match_id, season_id, team_id, player_id, event_type, note)
      values(m.id, m.season_id, scoring_team, p_player_id, 'Goal', 'Added by admin correction');
  else
    if p_player_id is not null then raise exception 'Scorer is not used when removing a goal'; end if;
    if scoring_team = m.home_team_id then
      if m.home_score = 0 then raise exception 'Score cannot be negative'; end if;
      update public.hockey_matches set home_score = home_score - 1 where id = m.id returning * into m;
    else
      if m.away_score = 0 then raise exception 'Score cannot be negative'; end if;
      update public.hockey_matches set away_score = away_score - 1 where id = m.id returning * into m;
    end if;
    update public.hockey_match_events set is_voided = true where id = goal.id;
    insert into public.hockey_match_events(match_id, season_id, team_id, event_type, reverses_event_id, note)
      values(m.id, m.season_id, scoring_team, 'Goal Removed', goal.id, 'Removed by admin correction');
  end if;
  return m;
end $$;

-- A final score edit also reconciles goal rows. Removed goals lose scorer credit;
-- additional goals remain unassigned until an admin selects their scorers.
create or replace function public.hockey_correct_result(
  p_match_id uuid, p_home_score int, p_away_score int
) returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; scoring_team uuid; target_score int; current_goals int; side int; goal_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_home_score is null or p_away_score is null or p_home_score < 0 or p_away_score < 0 then
    raise exception 'Scores must be zero or higher';
  end if;
  select * into m from public.hockey_matches where id = p_match_id and status = 'Completed' for update;
  if not found then raise exception 'Only completed results can be corrected'; end if;
  for side in 1..2 loop
    scoring_team := case when side = 1 then m.home_team_id else m.away_team_id end;
    target_score := case when side = 1 then p_home_score else p_away_score end;
    select count(*) into current_goals from public.hockey_match_events
      where match_id = m.id and team_id = scoring_team and event_type = 'Goal' and not is_voided;
    while current_goals > target_score loop
      select id into goal_id from public.hockey_match_events
        where match_id = m.id and team_id = scoring_team and event_type = 'Goal' and not is_voided
        order by created_at desc, id desc limit 1 for update;
      update public.hockey_match_events set is_voided = true where id = goal_id;
      insert into public.hockey_match_events(match_id, season_id, team_id, event_type, reverses_event_id, note)
        values(m.id, m.season_id, scoring_team, 'Goal Removed', goal_id, 'Removed by score correction');
      current_goals := current_goals - 1;
    end loop;
    while current_goals < target_score loop
      insert into public.hockey_match_events(match_id, season_id, team_id, event_type, note)
        values(m.id, m.season_id, scoring_team, 'Goal', 'Added by score correction');
      current_goals := current_goals + 1;
    end loop;
  end loop;
  update public.hockey_matches set home_score = p_home_score, away_score = p_away_score
    where id = m.id returning * into m;
  insert into public.hockey_match_events(match_id, season_id, event_type, note)
    values(m.id, m.season_id, 'Corrected', format('Result corrected to %s-%s', p_home_score, p_away_score));
  return m;
end $$;

revoke all on function public.hockey_correct_goal(uuid,text,uuid,uuid,uuid) from public, anon;
grant execute on function public.hockey_correct_goal(uuid,text,uuid,uuid,uuid) to authenticated;
revoke all on function public.hockey_correct_result(uuid,int,int) from public, anon;
grant execute on function public.hockey_correct_result(uuid,int,int) to authenticated;
notify pgrst, 'reload schema';
commit;
