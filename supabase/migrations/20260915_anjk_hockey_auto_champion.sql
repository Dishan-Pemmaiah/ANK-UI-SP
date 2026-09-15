-- Apply after 20260914_anjk_hockey_flexible_knockout.sql.
-- Keeps the season champion synchronized with the latest completed Final.
begin;

create or replace function public.hockey_sync_final_champion()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  affected_season uuid;
  final_changed boolean := false;
  resolved_champion uuid;
begin
  affected_season := case when tg_op = 'DELETE' then old.season_id else new.season_id end;

  if tg_op = 'INSERT' and new.status <> 'Completed' then return new; end if;
  if tg_op = 'UPDATE' and new.status is not distinct from old.status
    and new.winner_team_id is not distinct from old.winner_team_id
    and new.round_id is not distinct from old.round_id
    and new.season_id is not distinct from old.season_id then
    return new;
  end if;

  if tg_op <> 'INSERT' then
    final_changed := exists(select 1 from public.hockey_rounds where id=old.round_id and season_id=old.season_id and is_final);
  end if;
  if tg_op <> 'DELETE' then
    final_changed := final_changed or exists(select 1 from public.hockey_rounds where id=new.round_id and season_id=new.season_id and is_final);
  end if;
  if not final_changed then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  select m.winner_team_id into resolved_champion
  from public.hockey_matches m
  join public.hockey_rounds r on r.id=m.round_id and r.season_id=m.season_id
  where m.season_id=affected_season and r.is_final
    and m.status='Completed' and m.winner_team_id is not null
  order by m.completed_at desc nulls last,m.scheduled_at desc,m.id desc
  limit 1;

  update public.hockey_seasons set champion_team_id=resolved_champion where id=affected_season;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists hockey_final_champion_sync on public.hockey_matches;
create trigger hockey_final_champion_sync
after insert or update or delete on public.hockey_matches
for each row execute function public.hockey_sync_final_champion();

-- Bring existing completed Finals into sync without clearing deliberate values
-- for seasons that do not yet have a completed Final.
with completed_finals as (
  select distinct on (m.season_id) m.season_id,m.winner_team_id
  from public.hockey_matches m
  join public.hockey_rounds r on r.id=m.round_id and r.season_id=m.season_id
  where r.is_final and m.status='Completed' and m.winner_team_id is not null
  order by m.season_id,m.completed_at desc nulls last,m.scheduled_at desc,m.id desc
)
update public.hockey_seasons s
set champion_team_id=f.winner_team_id
from completed_finals f
where s.id=f.season_id;

commit;
