-- Additive ANJK hockey controls. Apply after 20260914_anjk_hockey_seasons.sql.
-- Legacy Sports tables and existing hockey records are preserved.
begin;

alter table public.hockey_seasons
  add column if not exists max_live_matches integer not null default 1;
alter table public.hockey_seasons
  add constraint hockey_positive_live_limit check (max_live_matches >= 1);

alter table public.hockey_matches
  add column if not exists phase text not null default 'Not Started';
update public.hockey_matches set phase = case
  when status = 'Live' then '1st Half'
  when status = 'Completed' then 'Finished'
  else 'Not Started' end;
alter table public.hockey_matches
  add constraint hockey_match_phase_valid check (phase in ('Not Started','1st Half','Half Time','2nd Half','Finished'));
alter table public.hockey_matches
  add constraint hockey_match_phase_matches_status check (
    (status = 'Live' and phase in ('1st Half','Half Time','2nd Half')) or
    (status = 'Completed' and phase = 'Finished') or
    (status in ('Upcoming','Postponed','Cancelled') and phase = 'Not Started')
  );

-- The season-row lock serializes starts even when two different fixtures are clicked at once.
-- max_live_matches can be raised for a future multi-ground season.
create or replace function public.hockey_check_live_limit() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare live_limit integer; current_live integer;
begin
  if new.status <> 'Live' then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'Live' then return new; end if;
  select max_live_matches into live_limit from public.hockey_seasons where id = new.season_id for update;
  if live_limit is null then raise exception 'Tournament season not found'; end if;
  select count(*) into current_live from public.hockey_matches
    where season_id = new.season_id and status = 'Live' and id is distinct from new.id;
  if current_live >= live_limit then
    raise exception 'Another match is already live. End or postpone it before starting this match.';
  end if;
  return new;
end $$;
drop trigger if exists hockey_one_live_match on public.hockey_matches;
create trigger hockey_one_live_match before insert or update of status on public.hockey_matches
  for each row execute function public.hockey_check_live_limit();

create or replace function public.hockey_check_live_setting() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if new.max_live_matches < (select count(*) from public.hockey_matches where season_id=new.id and status='Live') then
    raise exception 'End or postpone live matches before lowering the live-match limit.';
  end if;
  return new;
end $$;
drop trigger if exists hockey_live_setting on public.hockey_seasons;
create trigger hockey_live_setting before update of max_live_matches on public.hockey_seasons
  for each row execute function public.hockey_check_live_setting();

alter table public.hockey_match_events
  add column if not exists is_voided boolean not null default false,
  add column if not exists reverses_event_id uuid references public.hockey_match_events(id);
create unique index if not exists hockey_one_undo_per_goal on public.hockey_match_events(reverses_event_id)
  where reverses_event_id is not null;
create unique index if not exists hockey_player_team_season_key on public.hockey_players(id, team_id, season_id);
alter table public.hockey_match_events
  add constraint hockey_scorer_same_team foreign key (player_id, team_id, season_id)
  references public.hockey_players(id, team_id, season_id) on delete set null (player_id);

-- Link legacy undo rows to their latest prior goal so scorer totals exclude reversals.
do $$
declare removed record; goal_id uuid;
begin
  for removed in
    select id, match_id, team_id, created_at from public.hockey_match_events
    where event_type = 'Goal Removed' and reverses_event_id is null
    order by created_at, id
  loop
    select id into goal_id from public.hockey_match_events
      where match_id = removed.match_id and team_id = removed.team_id
        and event_type = 'Goal' and not is_voided and created_at <= removed.created_at
      order by created_at desc, id desc limit 1;
    if goal_id is not null then
      update public.hockey_match_events set is_voided = true where id = goal_id;
      update public.hockey_match_events set reverses_event_id = goal_id where id = removed.id;
    end if;
  end loop;
end $$;

-- Rescheduling a postponed fixture starts its score history fresh.
create or replace function public.hockey_prepare_rescheduled_match() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if old.status = 'Postponed' and new.status = 'Upcoming' then
    new.home_score := 0; new.away_score := 0;
    new.phase := 'Not Started'; new.started_at := null; new.completed_at := null;
  end if;
  return new;
end $$;
drop trigger if exists hockey_prepare_reschedule on public.hockey_matches;
create trigger hockey_prepare_reschedule before update of status on public.hockey_matches
  for each row execute function public.hockey_prepare_rescheduled_match();

create or replace function public.hockey_reset_rescheduled_goals() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if old.status = 'Postponed' and new.status = 'Upcoming' then
    update public.hockey_match_events set is_voided=true where match_id=new.id and event_type='Goal';
    insert into public.hockey_match_events(match_id,season_id,event_type,note)
      values(new.id,new.season_id,'Corrected','Score reset for rescheduled fixture');
  end if;
  return new;
end $$;
drop trigger if exists hockey_rescheduled_goals on public.hockey_matches;
create trigger hockey_rescheduled_goals after update of status on public.hockey_matches
  for each row execute function public.hockey_reset_rescheduled_goals();

-- Replace the original three-argument RPC in this transaction. The fourth argument is
-- optional for quick ground-side scoring but explicit in PostgREST calls.
drop function public.hockey_control_match(uuid,text,uuid);
create function public.hockey_control_match(
  p_match_id uuid, p_action text, p_team_id uuid default null, p_player_id uuid default null
) returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; next_status text; event_name text; scoring_team uuid; goal_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id = p_match_id for update;
  if not found then raise exception 'Match not found'; end if;

  if p_action = 'start' and m.status = 'Upcoming' then
    update public.hockey_matches set status='Live', phase='1st Half', started_at=now()
      where id=m.id returning * into m;
    event_name := 'Started';
  elsif p_action = 'end' and m.status = 'Live' then
    update public.hockey_matches set status='Completed', phase='Finished', completed_at=now()
      where id=m.id returning * into m;
    event_name := 'Completed';
  elsif p_action in ('phase_half','phase_second') and m.status = 'Live' then
    if p_action = 'phase_half' and m.phase = '1st Half' then next_status := 'Half Time';
    elsif p_action = 'phase_second' and m.phase = 'Half Time' then next_status := '2nd Half';
    else raise exception 'Invalid match phase transition from %', m.phase; end if;
    update public.hockey_matches set phase=next_status where id=m.id returning * into m;
    event_name := 'Phase Changed';
  elsif p_action in ('home_goal','away_goal','home_undo','away_undo') and m.status = 'Live' then
    scoring_team := case when p_action like 'home_%' then m.home_team_id else m.away_team_id end;
    if p_team_id is distinct from scoring_team then raise exception 'Team does not match action'; end if;
    if p_action like '%goal' then
      if p_player_id is not null and not exists (
        select 1 from public.hockey_players where id=p_player_id and team_id=scoring_team and season_id=m.season_id
      ) then raise exception 'Scorer must belong to the scoring team'; end if;
      if p_action = 'home_goal' then update public.hockey_matches set home_score=home_score+1 where id=m.id returning * into m;
      else update public.hockey_matches set away_score=away_score+1 where id=m.id returning * into m; end if;
      event_name := 'Goal';
    else
      if p_player_id is not null then raise exception 'Scorer is only allowed for a goal'; end if;
      if p_action = 'home_undo' and m.home_score > 0 then update public.hockey_matches set home_score=home_score-1 where id=m.id returning * into m;
      elsif p_action = 'away_undo' and m.away_score > 0 then update public.hockey_matches set away_score=away_score-1 where id=m.id returning * into m;
      else raise exception 'Score cannot be negative'; end if;
      select id into goal_id from public.hockey_match_events
        where match_id=m.id and team_id=scoring_team and event_type='Goal' and not is_voided
        order by created_at desc, id desc limit 1;
      if goal_id is not null then update public.hockey_match_events set is_voided=true where id=goal_id; end if;
      event_name := 'Goal Removed';
    end if;
  elsif p_action in ('postpone','cancel') and m.status in ('Upcoming','Live') then
    next_status := case when p_action='postpone' then 'Postponed' else 'Cancelled' end;
    update public.hockey_matches set status=next_status, phase='Not Started'
      where id=m.id returning * into m;
    event_name := next_status;
  else
    raise exception 'Action % is invalid for % match',p_action,m.status;
  end if;

  if event_name is not null then
    insert into public.hockey_match_events(match_id,season_id,team_id,player_id,event_type,reverses_event_id,note)
      values(m.id,m.season_id,case when event_name in ('Goal','Goal Removed') then scoring_team else null end,
        case when event_name='Goal' then p_player_id else null end,
        event_name,case when event_name='Goal Removed' then goal_id else null end,
        case when event_name='Phase Changed' then m.phase else '' end);
  end if;
  return m;
end $$;
alter table public.hockey_match_events drop constraint hockey_match_events_event_type_check;
alter table public.hockey_match_events add constraint hockey_match_events_event_type_check
  check (event_type in ('Goal','Goal Removed','Started','Completed','Corrected','Postponed','Cancelled','Phase Changed'));
revoke all on function public.hockey_control_match(uuid,text,uuid,uuid) from public,anon;
grant execute on function public.hockey_control_match(uuid,text,uuid,uuid) to authenticated;

notify pgrst, 'reload schema';
commit;
