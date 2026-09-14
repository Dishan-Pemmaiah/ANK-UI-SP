-- Repair for installations where a postponed fixture can be rescheduled while
-- old goal/scorer events remain active. Apply after the match-control follow-up.
-- Keeps all match/event rows; only voids prior goals for a fixture being reset.
begin;

create or replace function public.hockey_prepare_rescheduled_match() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
  if old.status = 'Postponed' and new.status = 'Upcoming' then
    new.home_score := 0;
    new.away_score := 0;
    new.phase := 'Not Started';
    new.started_at := null;
    new.completed_at := null;

    update public.hockey_match_events
      set is_voided = true
      where match_id = new.id and event_type = 'Goal' and not is_voided;

    insert into public.hockey_match_events(match_id, season_id, event_type, note)
      values(new.id, new.season_id, 'Corrected', 'Score reset for rescheduled fixture');
  end if;
  return new;
end $$;

-- One trigger performs the reset atomically. Drop the older after-trigger if
-- present to avoid duplicate history entries.
drop trigger if exists hockey_rescheduled_goals on public.hockey_matches;
drop trigger if exists hockey_prepare_reschedule on public.hockey_matches;
create trigger hockey_prepare_reschedule
  before update on public.hockey_matches
  for each row execute function public.hockey_prepare_rescheduled_match();
alter table public.hockey_matches enable trigger hockey_prepare_reschedule;

notify pgrst, 'reload schema';
commit;
