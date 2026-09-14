-- Apply only after the flexible-knockout and draw-document migrations.
-- Repairs installations made before the published-history guard was added,
-- and restores the exact knockout correction RPC expected by the CMS.
begin;

create or replace function public.hockey_prevent_published_document_delete() returns trigger
language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  if old.ever_published then raise exception 'Published official revisions remain in history; unpublish instead'; end if;
  return old;
end $$;
drop trigger if exists hockey_document_delete_guard on public.hockey_tournament_documents;
create trigger hockey_document_delete_guard before delete on public.hockey_tournament_documents
  for each row execute function public.hockey_prevent_published_document_delete();

drop function if exists public.hockey_correct_knockout_result(uuid,integer,integer,uuid,text,integer,integer);
create function public.hockey_correct_knockout_result(p_match_id uuid,p_home_score integer,p_away_score integer,
  p_winner_team_id uuid,p_decision_method text,p_shootout_home integer default null,p_shootout_away integer default null)
returns public.hockey_matches language plpgsql security invoker set search_path=public,pg_temp as $$
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
revoke all on function public.hockey_correct_knockout_result(uuid,integer,integer,uuid,text,integer,integer) from public,anon;
grant execute on function public.hockey_correct_knockout_result(uuid,integer,integer,uuid,text,integer,integer) to authenticated;
notify pgrst,'reload schema';
commit;
