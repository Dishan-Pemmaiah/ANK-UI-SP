-- Flexible knockout extension. Apply after all earlier ANJK hockey migrations.
-- Legacy Sports tables and the league standings view are unchanged.
begin;

alter table public.hockey_seasons
  add column tournament_format text not null default 'League';
alter table public.hockey_seasons
  add constraint hockey_tournament_format_valid
  check (tournament_format in ('League', 'Knockout', 'Mixed'));

create table public.hockey_rounds (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, season_id),
  unique (season_id, name)
);
create index hockey_rounds_order on public.hockey_rounds(season_id, sort_order, name);
create unique index hockey_one_final_round on public.hockey_rounds(season_id) where is_final;
create trigger hockey_rounds_updated before update on public.hockey_rounds
  for each row execute function public.hockey_touch_updated_at();
alter table public.hockey_rounds enable row level security;
create policy "read hockey rounds" on public.hockey_rounds for select using (true);
create policy "admin hockey rounds" on public.hockey_rounds for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select on public.hockey_rounds to anon, authenticated;
grant insert, update, delete on public.hockey_rounds to authenticated;

alter table public.hockey_matches
  alter column home_team_id drop not null,
  alter column away_team_id drop not null,
  add column round_id uuid,
  add column match_number integer check (match_number > 0),
  add column home_source_match_id uuid,
  add column away_source_match_id uuid,
  add column winner_team_id uuid,
  add column decision_method text,
  add column shootout_home integer,
  add column shootout_away integer,
  add column next_match_id uuid,
  add column next_slot text,
  add column auto_advance boolean not null default false;
alter table public.hockey_matches drop constraint hockey_matches_stage_check;
alter table public.hockey_matches
  add constraint hockey_stage_not_empty check (length(trim(stage)) > 0),
  add constraint hockey_round_same_season foreign key (round_id, season_id)
    references public.hockey_rounds(id, season_id) on delete restrict,
  add constraint hockey_home_source_same_season foreign key (home_source_match_id, season_id)
    references public.hockey_matches(id, season_id) on delete restrict,
  add constraint hockey_away_source_same_season foreign key (away_source_match_id, season_id)
    references public.hockey_matches(id, season_id) on delete restrict,
  add constraint hockey_winner_same_season foreign key (winner_team_id, season_id)
    references public.hockey_teams(id, season_id) on delete restrict,
  add constraint hockey_next_same_season foreign key (next_match_id, season_id)
    references public.hockey_matches(id, season_id) on delete restrict,
  add constraint hockey_next_slot_pair check ((next_match_id is null and next_slot is null and not auto_advance)
    or (next_match_id is not null and next_slot in ('home', 'away'))),
  add constraint hockey_decision_valid check (decision_method is null or decision_method in ('Normal', 'Shootout', 'Walkover', 'Other')),
  add constraint hockey_shootout_scores_valid check (
    (shootout_home is null and shootout_away is null) or
    (decision_method = 'Shootout' and shootout_home is not null and shootout_away is not null
      and shootout_home >= 0 and shootout_away >= 0 and shootout_home <> shootout_away)),
  add constraint hockey_no_self_source check (
    home_source_match_id is distinct from id and away_source_match_id is distinct from id and next_match_id is distinct from id);
create index hockey_matches_round on public.hockey_matches(season_id, round_id, scheduled_at);
create unique index hockey_match_number_per_season on public.hockey_matches(season_id, match_number)
  where match_number is not null;
create unique index hockey_one_source_per_destination on public.hockey_matches(next_match_id, next_slot)
  where next_match_id is not null;

create table public.hockey_advancements (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  kind text not null check (kind in ('Winner', 'Bye')),
  source_match_id uuid,
  team_id uuid not null,
  target_match_id uuid not null,
  target_slot text not null check (target_slot in ('home', 'away')),
  note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  removed_at timestamptz,
  foreign key (source_match_id, season_id) references public.hockey_matches(id, season_id) on delete restrict,
  foreign key (target_match_id, season_id) references public.hockey_matches(id, season_id) on delete restrict,
  foreign key (team_id, season_id) references public.hockey_teams(id, season_id) on delete restrict,
  constraint hockey_advancement_source check ((kind = 'Winner' and source_match_id is not null)
    or (kind = 'Bye' and source_match_id is null)),
  constraint hockey_advancement_removed check (is_active = (removed_at is null))
);
create unique index hockey_active_target_slot on public.hockey_advancements(target_match_id, target_slot) where is_active;
create unique index hockey_active_winner_source on public.hockey_advancements(source_match_id) where is_active and kind = 'Winner';
create index hockey_advancements_season on public.hockey_advancements(season_id, created_at desc);
alter table public.hockey_advancements enable row level security;
create policy "read hockey advancements" on public.hockey_advancements for select using (true);
create policy "admin hockey advancements" on public.hockey_advancements for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
grant select on public.hockey_advancements to anon, authenticated;
grant insert, update on public.hockey_advancements to authenticated;

-- ANJK 3 is configured as data. No slug checks appear in knockout behavior.
update public.hockey_seasons set tournament_format = 'Knockout' where slug = 'anjk-3';
-- Existing non-tied results can be safely identified; tied results await admin review.
update public.hockey_matches m set winner_team_id = case
  when home_score > away_score then home_team_id else away_team_id end,
  decision_method = 'Normal'
where m.status = 'Completed' and m.home_score <> m.away_score
  and (select tournament_format from public.hockey_seasons where id = m.season_id) = 'Knockout';

create function public.hockey_match_is_knockout(p_match public.hockey_matches)
returns boolean language sql stable security invoker set search_path = public, pg_temp as $$
  select s.tournament_format = 'Knockout' or
    (s.tournament_format = 'Mixed' and (p_match.round_id is not null or p_match.stage not in ('Group', 'League')))
  from public.hockey_seasons s where s.id = p_match.season_id
$$;

create function public.hockey_guard_knockout_match() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
declare knockout boolean; result_changed boolean;
begin
  knockout := public.hockey_match_is_knockout(new);
  if not knockout then
    if new.home_team_id is null or new.away_team_id is null then
      raise exception 'League fixtures require both teams';
    end if;
    if new.round_id is not null or new.winner_team_id is not null or new.next_match_id is not null then
      raise exception 'Knockout fields require a Knockout or Mixed tournament';
    end if;
    return new;
  end if;
  if new.status in ('Live', 'Completed') and (new.home_team_id is null or new.away_team_id is null) then
    raise exception 'Resolve both actual teams before starting or completing this match';
  end if;
  if new.home_source_match_id is not null and new.home_source_match_id = new.away_source_match_id then
    raise exception 'Both slots cannot depend on the same match';
  end if;
  if (new.home_source_match_id is not null and new.home_team_id is not null and
      new.home_team_id is distinct from (select winner_team_id from public.hockey_matches where id=new.home_source_match_id)) or
     (new.away_source_match_id is not null and new.away_team_id is not null and
      new.away_team_id is distinct from (select winner_team_id from public.hockey_matches where id=new.away_source_match_id)) then
    raise exception 'A winner slot can only contain its confirmed source winner';
  end if;
  if tg_op = 'UPDATE' then
    if old.status in ('Live', 'Completed') and
      (new.home_team_id is distinct from old.home_team_id or new.away_team_id is distinct from old.away_team_id) then
      raise exception 'Participants cannot change after a knockout match starts';
    end if;
    if (new.home_score is distinct from old.home_score or new.away_score is distinct from old.away_score or
        new.winner_team_id is distinct from old.winner_team_id or
        new.home_team_id is distinct from old.home_team_id or new.away_team_id is distinct from old.away_team_id) and
      exists (select 1 from public.hockey_advancements where source_match_id = old.id and is_active) then
      raise exception 'Remove the existing winner advancement before correcting this result';
    end if;
    if (new.home_team_id is distinct from old.home_team_id and exists
        (select 1 from public.hockey_advancements where target_match_id=old.id and target_slot='home' and is_active)) or
       (new.away_team_id is distinct from old.away_team_id and exists
        (select 1 from public.hockey_advancements where target_match_id=old.id and target_slot='away' and is_active)) then
      raise exception 'Remove the destination advancement before changing its participant';
    end if;
    result_changed := new.status is distinct from old.status or
      new.winner_team_id is distinct from old.winner_team_id or
      new.home_score is distinct from old.home_score or new.away_score is distinct from old.away_score or
      new.decision_method is distinct from old.decision_method or
      new.shootout_home is distinct from old.shootout_home or new.shootout_away is distinct from old.shootout_away;
  else
    result_changed := true;
  end if;
  if result_changed and new.status = 'Completed' then
    if new.winner_team_id is null or new.winner_team_id not in (new.home_team_id, new.away_team_id) then
      raise exception 'Completed knockout match requires an explicit participant as winner';
    end if;
    if new.decision_method is null then raise exception 'Select a knockout decision method'; end if;
    if new.decision_method = 'Normal' and (new.home_score = new.away_score or
        new.winner_team_id is distinct from case when new.home_score > new.away_score then new.home_team_id else new.away_team_id end) then
      raise exception 'Normal-time winner must have the higher score';
    end if;
    if new.decision_method = 'Shootout' and (new.home_score <> new.away_score or
        new.shootout_home is null or new.shootout_away is null or
        new.winner_team_id is distinct from case when new.shootout_home > new.shootout_away then new.home_team_id else new.away_team_id end) then
      raise exception 'Shootout requires a tied score and the shootout winner';
    end if;
  end if;
  return new;
end $$;
create trigger hockey_knockout_guard before insert or update on public.hockey_matches
  for each row execute function public.hockey_guard_knockout_match();

-- Lock the source before the destination, matching completion/progression order.
-- Serialize destination writes through its row lock; never overwrite occupied slots.
create function public.hockey_place_advancement(p_kind text, p_source_match_id uuid, p_team_id uuid,
  p_target_match_id uuid, p_slot text, p_note text default '')
returns public.hockey_advancements language plpgsql security invoker set search_path = public, pg_temp as $$
declare target public.hockey_matches; source public.hockey_matches; advancement public.hockey_advancements;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_slot not in ('home', 'away') then raise exception 'Select Team A or Team B slot'; end if;
  if p_kind = 'Winner' then
    select * into source from public.hockey_matches where id=p_source_match_id for update;
    if not found or source.status <> 'Completed' or source.winner_team_id is distinct from p_team_id then
      raise exception 'Only the confirmed winner of a completed match can advance';
    end if;
    if not public.hockey_match_is_knockout(source) then raise exception 'Source must be a knockout fixture'; end if;
  elsif p_kind <> 'Bye' or p_source_match_id is not null then
    raise exception 'Invalid advancement type';
  end if;
  select * into target from public.hockey_matches where id=p_target_match_id for update;
  if not found or target.status not in ('Upcoming', 'Postponed') then
    raise exception 'Destination must be an unstarted fixture';
  end if;
  if not public.hockey_match_is_knockout(target) then raise exception 'Destination must be a knockout fixture'; end if;
  if p_kind = 'Winner' and (source.season_id <> target.season_id or source.id = target.id) then
    raise exception 'Matches must be different and in the same season';
  end if;
  if not exists (select 1 from public.hockey_teams where id=p_team_id and season_id=target.season_id) then
    raise exception 'Team must belong to the destination season';
  end if;
  if exists (select 1 from public.hockey_advancements where target_match_id=target.id and target_slot=p_slot and is_active) then
    raise exception 'Destination slot already has an advancement. Remove it first.';
  end if;
  if (p_slot='home' and target.home_source_match_id is not null and
      (p_kind='Bye' or target.home_source_match_id is distinct from p_source_match_id)) or
     (p_slot='away' and target.away_source_match_id is not null and
      (p_kind='Bye' or target.away_source_match_id is distinct from p_source_match_id)) then
    raise exception 'Destination slot is reserved for another winner. Clear that progression first.';
  end if;
  if p_slot = 'home' then
    if target.home_team_id is not null then raise exception 'Team A slot is occupied. Existing team was not changed.'; end if;
    if target.away_team_id = p_team_id then raise exception 'Same team cannot occupy both slots'; end if;
    update public.hockey_matches set home_team_id=p_team_id,
      home_source_match_id=case when p_kind='Winner' then p_source_match_id else null end
      where id=target.id;
  else
    if target.away_team_id is not null then raise exception 'Team B slot is occupied. Existing team was not changed.'; end if;
    if target.home_team_id = p_team_id then raise exception 'Same team cannot occupy both slots'; end if;
    update public.hockey_matches set away_team_id=p_team_id,
      away_source_match_id=case when p_kind='Winner' then p_source_match_id else null end
      where id=target.id;
  end if;
  insert into public.hockey_advancements(season_id,kind,source_match_id,team_id,target_match_id,target_slot,note)
    values(target.season_id,p_kind,p_source_match_id,p_team_id,target.id,p_slot,coalesce(p_note,'')) returning * into advancement;
  return advancement;
end $$;

create function public.hockey_remove_advancement(p_advancement_id uuid)
returns public.hockey_advancements language plpgsql security invoker set search_path = public, pg_temp as $$
declare advancement public.hockey_advancements; target public.hockey_matches;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into advancement from public.hockey_advancements where id=p_advancement_id and is_active for update;
  if not found then raise exception 'Active advancement not found'; end if;
  select * into target from public.hockey_matches where id=advancement.target_match_id for update;
  if target.status not in ('Upcoming', 'Postponed') then
    raise exception 'Cannot change an advancement after the destination match starts';
  end if;
  update public.hockey_advancements set is_active=false, removed_at=now() where id=advancement.id returning * into advancement;
  if advancement.target_slot='home' then
    if target.home_team_id is distinct from advancement.team_id then raise exception 'Destination team changed; review before removing'; end if;
    update public.hockey_matches set home_team_id=null, home_source_match_id=null where id=target.id;
  else
    if target.away_team_id is distinct from advancement.team_id then raise exception 'Destination team changed; review before removing'; end if;
    update public.hockey_matches set away_team_id=null, away_source_match_id=null where id=target.id;
  end if;
  if advancement.source_match_id is not null then
    update public.hockey_matches set next_match_id=null,next_slot=null,auto_advance=false
      where id=advancement.source_match_id and next_match_id=advancement.target_match_id and next_slot=advancement.target_slot;
  end if;
  return advancement;
end $$;

create function public.hockey_set_progression(p_source_match_id uuid, p_target_match_id uuid,
  p_slot text, p_automatic boolean default false)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare source public.hockey_matches; target public.hockey_matches; old_target public.hockey_matches;
  linked uuid; cycle_found boolean;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into source from public.hockey_matches where id=p_source_match_id for update;
  if not found or not public.hockey_match_is_knockout(source) then raise exception 'Knockout source match not found'; end if;
  if exists (select 1 from public.hockey_advancements where source_match_id=source.id and is_active) then
    raise exception 'Remove the existing advancement before changing progression';
  end if;
  if source.next_match_id is not null then
    select * into old_target from public.hockey_matches where id=source.next_match_id for update;
    if old_target.status not in ('Upcoming','Postponed') then raise exception 'Cannot change progression after the destination starts'; end if;
    if source.next_slot='home' and old_target.home_team_id is null then
      update public.hockey_matches set home_source_match_id=null where id=old_target.id and home_source_match_id=source.id;
    elsif source.next_slot='away' and old_target.away_team_id is null then
      update public.hockey_matches set away_source_match_id=null where id=old_target.id and away_source_match_id=source.id;
    end if;
  end if;
  if p_target_match_id is null then
    update public.hockey_matches set next_match_id=null,next_slot=null,auto_advance=false
      where id=source.id returning * into source;
    return source;
  end if;
  if p_slot not in ('home','away') then raise exception 'Select Team A or Team B slot'; end if;
  select * into target from public.hockey_matches where id=p_target_match_id for update;
  if not found or target.status not in ('Upcoming','Postponed') or
     target.season_id <> source.season_id or not public.hockey_match_is_knockout(target) or target.id=source.id then
    raise exception 'Select an unstarted knockout fixture in the same season';
  end if;
  with recursive chain(id, next_id) as (
    select target.id, target.next_match_id
    union all
    select m.id, m.next_match_id from public.hockey_matches m join chain c on m.id=c.next_id
      where m.id <> source.id
  ) select exists(select 1 from chain where id=source.id or next_id=source.id) into cycle_found;
  if cycle_found then raise exception 'Progression would create a cycle'; end if;
  if exists (select 1 from public.hockey_matches where next_match_id=target.id and next_slot=p_slot and id<>source.id) then
    raise exception 'Another match already feeds this destination slot';
  end if;
  if exists (select 1 from public.hockey_advancements where target_match_id=target.id and target_slot=p_slot and is_active) then
    raise exception 'Destination slot already has an advancement';
  end if;
  if (p_slot='home' and target.home_team_id is not null) or
     (p_slot='away' and target.away_team_id is not null) then
    raise exception 'Destination slot is occupied. Existing team was not changed.';
  end if;
  if source.round_id is not null and target.round_id is not null and
    (select sort_order from public.hockey_rounds where id=target.round_id) <=
    (select sort_order from public.hockey_rounds where id=source.round_id) then
    raise exception 'Destination must be in a later round';
  end if;
  update public.hockey_matches set next_match_id=target.id,next_slot=p_slot,auto_advance=coalesce(p_automatic,false)
    where id=source.id returning * into source;
  if p_slot='home' then
    update public.hockey_matches set home_source_match_id=source.id where id=target.id;
  else
    update public.hockey_matches set away_source_match_id=source.id where id=target.id;
  end if;
  if source.status='Completed' and p_automatic then
    perform public.hockey_place_advancement('Winner', source.id, source.winner_team_id, target.id, p_slot, 'Automatic advancement');
  end if;
  return source;
end $$;

create function public.hockey_advance_winner(p_source_match_id uuid,p_target_match_id uuid,p_slot text)
returns public.hockey_advancements language plpgsql security invoker set search_path = public, pg_temp as $$
declare source public.hockey_matches; advancement public.hockey_advancements;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into source from public.hockey_matches where id=p_source_match_id for update;
  if not found or source.status<>'Completed' or source.winner_team_id is null then
    raise exception 'Confirm a completed knockout winner first';
  end if;
  if source.next_match_id is distinct from p_target_match_id or source.next_slot is distinct from p_slot then
    perform public.hockey_set_progression(source.id,p_target_match_id,p_slot,false);
  end if;
  select * into advancement from public.hockey_place_advancement('Winner',source.id,source.winner_team_id,
    p_target_match_id,p_slot,'Manual winner advancement');
  return advancement;
end $$;

create function public.hockey_assign_bye(p_team_id uuid,p_target_match_id uuid,p_slot text,p_note text default '')
returns public.hockey_advancements language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  return public.hockey_place_advancement('Bye',null,p_team_id,p_target_match_id,p_slot,p_note);
end $$;

create function public.hockey_complete_knockout_match(p_match_id uuid,p_winner_team_id uuid,
  p_decision_method text,p_shootout_home integer default null,p_shootout_away integer default null)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id=p_match_id for update;
  if not found or not public.hockey_match_is_knockout(m) then raise exception 'Knockout match not found'; end if;
  if m.status<>'Live' and not (m.status='Upcoming' and p_decision_method='Walkover') then
    raise exception 'Only a live match or an upcoming walkover can be completed';
  end if;
  if m.home_team_id is null or m.away_team_id is null then raise exception 'Resolve both teams first'; end if;
  update public.hockey_matches set status='Completed',phase='Finished',completed_at=now(),
    winner_team_id=p_winner_team_id,decision_method=p_decision_method,
    shootout_home=p_shootout_home,shootout_away=p_shootout_away
    where id=m.id returning * into m;
  insert into public.hockey_match_events(match_id,season_id,event_type,note)
    values(m.id,m.season_id,'Completed',format('Winner confirmed (%s)',m.decision_method));
  if m.auto_advance and m.next_match_id is not null then
    perform public.hockey_place_advancement('Winner',m.id,m.winner_team_id,m.next_match_id,m.next_slot,'Automatic advancement');
  end if;
  return m;
end $$;

create function public.hockey_set_knockout_winner(p_match_id uuid,p_winner_team_id uuid,
  p_decision_method text,p_shootout_home integer default null,p_shootout_away integer default null)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id=p_match_id for update;
  if not found or m.status<>'Completed' or not public.hockey_match_is_knockout(m) then
    raise exception 'Only a completed knockout winner can be corrected';
  end if;
  update public.hockey_matches set winner_team_id=p_winner_team_id,decision_method=p_decision_method,
    shootout_home=p_shootout_home,shootout_away=p_shootout_away where id=m.id returning * into m;
  insert into public.hockey_match_events(match_id,season_id,event_type,note)
    values(m.id,m.season_id,'Corrected',format('Winner corrected (%s)',m.decision_method));
  return m;
end $$;

-- Correct score and winner together; goal rows retain the same reconciliation
-- semantics as the existing score-correction RPC. Active advancement blocks it.
create function public.hockey_correct_knockout_result(p_match_id uuid,p_home_score integer,p_away_score integer,
  p_winner_team_id uuid,p_decision_method text,p_shootout_home integer default null,p_shootout_away integer default null)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; scoring_team uuid; target_score integer; current_goals integer;
  side integer; goal_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_home_score is null or p_away_score is null or p_home_score < 0 or p_away_score < 0 then
    raise exception 'Scores must be zero or higher'; end if;
  select * into m from public.hockey_matches where id=p_match_id for update;
  if not found or m.status<>'Completed' or not public.hockey_match_is_knockout(m) then
    raise exception 'Only a completed knockout result can be corrected'; end if;
  if exists (select 1 from public.hockey_advancements where source_match_id=m.id and is_active) then
    raise exception 'Remove winner advancement before correcting the result'; end if;
  for side in 1..2 loop
    scoring_team:=case when side=1 then m.home_team_id else m.away_team_id end;
    target_score:=case when side=1 then p_home_score else p_away_score end;
    select count(*) into current_goals from public.hockey_match_events where match_id=m.id
      and team_id=scoring_team and event_type='Goal' and not is_voided;
    while current_goals>target_score loop
      select id into goal_id from public.hockey_match_events where match_id=m.id
        and team_id=scoring_team and event_type='Goal' and not is_voided
        order by created_at desc,id desc limit 1 for update;
      update public.hockey_match_events set is_voided=true where id=goal_id;
      insert into public.hockey_match_events(match_id,season_id,team_id,event_type,reverses_event_id,note)
        values(m.id,m.season_id,scoring_team,'Goal Removed',goal_id,'Removed by knockout result correction');
      current_goals:=current_goals-1;
    end loop;
    while current_goals<target_score loop
      insert into public.hockey_match_events(match_id,season_id,team_id,event_type,note)
        values(m.id,m.season_id,scoring_team,'Goal','Added by knockout result correction');
      current_goals:=current_goals+1;
    end loop;
  end loop;
  update public.hockey_matches set home_score=p_home_score,away_score=p_away_score,
    winner_team_id=p_winner_team_id,decision_method=p_decision_method,
    shootout_home=p_shootout_home,shootout_away=p_shootout_away
    where id=m.id returning * into m;
  insert into public.hockey_match_events(match_id,season_id,event_type,note)
    values(m.id,m.season_id,'Corrected',format('Knockout result corrected to %s-%s (%s)',p_home_score,p_away_score,p_decision_method));
  return m;
end $$;

-- Retain the four-argument scoring RPC and every existing goal/phase behavior.
create or replace function public.hockey_control_match(
  p_match_id uuid,p_action text,p_team_id uuid default null,p_player_id uuid default null
) returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; next_status text; event_name text; scoring_team uuid; goal_id uuid;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id=p_match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if p_action='start' and m.status='Upcoming' then
    if public.hockey_match_is_knockout(m) and (m.home_team_id is null or m.away_team_id is null) then
      raise exception 'Resolve both actual teams before starting this match';
    end if;
    update public.hockey_matches set status='Live',phase='1st Half',started_at=now()
      where id=m.id returning * into m; event_name:='Started';
  elsif p_action='end' and m.status='Live' then
    if public.hockey_match_is_knockout(m) then raise exception 'Confirm the knockout winner and method before ending'; end if;
    update public.hockey_matches set status='Completed',phase='Finished',completed_at=now()
      where id=m.id returning * into m; event_name:='Completed';
  elsif p_action in ('phase_half','phase_second') and m.status='Live' then
    if p_action='phase_half' and m.phase='1st Half' then next_status:='Half Time';
    elsif p_action='phase_second' and m.phase='Half Time' then next_status:='2nd Half';
    else raise exception 'Invalid match phase transition from %',m.phase; end if;
    update public.hockey_matches set phase=next_status where id=m.id returning * into m; event_name:='Phase Changed';
  elsif p_action in ('home_goal','away_goal','home_undo','away_undo') and m.status='Live' then
    scoring_team:=case when p_action like 'home_%' then m.home_team_id else m.away_team_id end;
    if p_team_id is distinct from scoring_team then raise exception 'Team does not match action'; end if;
    if p_action like '%goal' then
      if p_player_id is not null and not exists (select 1 from public.hockey_players
        where id=p_player_id and team_id=scoring_team and season_id=m.season_id) then
        raise exception 'Scorer must belong to the scoring team'; end if;
      if p_action='home_goal' then update public.hockey_matches set home_score=home_score+1 where id=m.id returning * into m;
      else update public.hockey_matches set away_score=away_score+1 where id=m.id returning * into m; end if;
      event_name:='Goal';
    else
      if p_player_id is not null then raise exception 'Scorer is only allowed for a goal'; end if;
      if p_action='home_undo' and m.home_score>0 then update public.hockey_matches set home_score=home_score-1 where id=m.id returning * into m;
      elsif p_action='away_undo' and m.away_score>0 then update public.hockey_matches set away_score=away_score-1 where id=m.id returning * into m;
      else raise exception 'Score cannot be negative'; end if;
      select id into goal_id from public.hockey_match_events where match_id=m.id and team_id=scoring_team
        and event_type='Goal' and not is_voided order by created_at desc,id desc limit 1;
      if goal_id is not null then update public.hockey_match_events set is_voided=true where id=goal_id; end if;
      event_name:='Goal Removed';
    end if;
  elsif p_action in ('postpone','cancel') and m.status in ('Upcoming','Live') then
    next_status:=case when p_action='postpone' then 'Postponed' else 'Cancelled' end;
    update public.hockey_matches set status=next_status,phase='Not Started' where id=m.id returning * into m;
    event_name:=next_status;
  else raise exception 'Action % is invalid for % match',p_action,m.status;
  end if;
  if event_name is not null then
    insert into public.hockey_match_events(match_id,season_id,team_id,player_id,event_type,reverses_event_id,note)
      values(m.id,m.season_id,case when event_name in ('Goal','Goal Removed') then scoring_team else null end,
        case when event_name='Goal' then p_player_id else null end,event_name,
        case when event_name='Goal Removed' then goal_id else null end,
        case when event_name='Phase Changed' then m.phase else '' end);
  end if;
  return m;
end $$;

revoke all on function public.hockey_match_is_knockout(public.hockey_matches) from public, anon;
revoke all on function public.hockey_place_advancement(text,uuid,uuid,uuid,text,text) from public, anon;
revoke all on function public.hockey_remove_advancement(uuid) from public, anon;
revoke all on function public.hockey_set_progression(uuid,uuid,text,boolean) from public, anon;
revoke all on function public.hockey_advance_winner(uuid,uuid,text) from public, anon;
revoke all on function public.hockey_assign_bye(uuid,uuid,text,text) from public, anon;
revoke all on function public.hockey_complete_knockout_match(uuid,uuid,text,integer,integer) from public, anon;
revoke all on function public.hockey_set_knockout_winner(uuid,uuid,text,integer,integer) from public, anon;
revoke all on function public.hockey_correct_knockout_result(uuid,integer,integer,uuid,text,integer,integer) from public, anon;
grant execute on function public.hockey_match_is_knockout(public.hockey_matches),
  public.hockey_place_advancement(text,uuid,uuid,uuid,text,text),
  public.hockey_remove_advancement(uuid),public.hockey_set_progression(uuid,uuid,text,boolean),
  public.hockey_advance_winner(uuid,uuid,text),public.hockey_assign_bye(uuid,uuid,text,text),
  public.hockey_complete_knockout_match(uuid,uuid,text,integer,integer),
  public.hockey_set_knockout_winner(uuid,uuid,text,integer,integer),
  public.hockey_correct_knockout_result(uuid,integer,integer,uuid,text,integer,integer) to authenticated;
notify pgrst, 'reload schema';
commit;
