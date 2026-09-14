-- Independent, reusable hockey seasons. Legacy Sports tables remain untouched.
begin;

create extension if not exists pgcrypto;

create table if not exists public.hockey_seasons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(trim(name)) > 0),
  description text not null default '',
  venue text not null default '',
  starts_at timestamptz,
  ends_at timestamptz,
  poster_url text not null default '',
  champion_team_id uuid,
  win_points int not null default 3 check (win_points >= 0),
  draw_points int not null default 1 check (draw_points >= 0),
  loss_points int not null default 0 check (loss_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hockey_season_dates check (ends_at is null or starts_at is null or ends_at >= starts_at)
);

create table if not exists public.hockey_teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  logo_url text not null default '',
  pool text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, name),
  unique (id, season_id)
);
alter table public.hockey_seasons add constraint hockey_champion_same_season
  foreign key (champion_team_id, id) references public.hockey_teams(id, season_id) on delete set null (champion_team_id);

create table if not exists public.hockey_players (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null,
  team_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  shirt_number int check (shirt_number between 0 and 99),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (team_id, season_id) references public.hockey_teams(id, season_id) on delete cascade
);

create table if not exists public.hockey_matches (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  home_team_id uuid not null,
  away_team_id uuid not null,
  scheduled_at timestamptz not null,
  venue text not null default '',
  pool text not null default '',
  stage text not null default 'Group' check (stage in ('Group','League','Quarter Final','Semi Final','Final')),
  round_label text not null default '',
  status text not null default 'Upcoming' check (status in ('Upcoming','Live','Completed','Postponed','Cancelled')),
  home_score int not null default 0 check (home_score >= 0),
  away_score int not null default 0 check (away_score >= 0),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, season_id),
  constraint hockey_distinct_teams check (home_team_id <> away_team_id),
  constraint hockey_matches_home_team_id_fkey foreign key (home_team_id, season_id) references public.hockey_teams(id, season_id),
  constraint hockey_matches_away_team_id_fkey foreign key (away_team_id, season_id) references public.hockey_teams(id, season_id)
);

create table if not exists public.hockey_match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  season_id uuid not null,
  team_id uuid,
  player_id uuid references public.hockey_players(id) on delete set null,
  event_type text not null check (event_type in ('Goal','Goal Removed','Started','Completed','Corrected','Postponed','Cancelled')),
  note text not null default '',
  created_at timestamptz not null default now(),
  foreign key (match_id, season_id) references public.hockey_matches(id, season_id) on delete cascade,
  foreign key (team_id, season_id) references public.hockey_teams(id, season_id)
);

create table if not exists public.hockey_announcements (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.hockey_seasons(id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  body text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hockey_matches_season_schedule on public.hockey_matches(season_id, scheduled_at);
create index if not exists hockey_matches_season_status on public.hockey_matches(season_id, status);
create index if not exists hockey_matches_pool_stage on public.hockey_matches(season_id, pool, stage);
create index if not exists hockey_teams_pool on public.hockey_teams(season_id, pool);
create index if not exists hockey_events_match_time on public.hockey_match_events(match_id, created_at desc);
create index if not exists hockey_announcements_season_time on public.hockey_announcements(season_id, created_at desc);

create or replace function public.hockey_touch_updated_at() returns trigger
language plpgsql set search_path = public, pg_temp as $$
begin new.updated_at := now(); return new; end $$;
create trigger hockey_seasons_updated before update on public.hockey_seasons for each row execute function public.hockey_touch_updated_at();
create trigger hockey_teams_updated before update on public.hockey_teams for each row execute function public.hockey_touch_updated_at();
create trigger hockey_players_updated before update on public.hockey_players for each row execute function public.hockey_touch_updated_at();
create trigger hockey_matches_updated before update on public.hockey_matches for each row execute function public.hockey_touch_updated_at();
create trigger hockey_announcements_updated before update on public.hockey_announcements for each row execute function public.hockey_touch_updated_at();

-- A security-invoker view is always current, including after a corrected result.
create or replace view public.hockey_standings with (security_invoker = true) as
with results as (
  select m.season_id, m.home_team_id team_id, m.home_score gf, m.away_score ga from public.hockey_matches m
  where m.status = 'Completed' and m.stage in ('Group','League')
  union all
  select m.season_id, m.away_team_id, m.away_score, m.home_score from public.hockey_matches m
  where m.status = 'Completed' and m.stage in ('Group','League')
)
select t.season_id, t.id team_id, t.name team_name, t.logo_url, t.pool,
  count(r.team_id)::int played,
  count(*) filter (where r.gf > r.ga)::int won,
  count(*) filter (where r.gf = r.ga)::int drawn,
  count(*) filter (where r.gf < r.ga)::int lost,
  coalesce(sum(r.gf),0)::int goals_for,
  coalesce(sum(r.ga),0)::int goals_against,
  coalesce(sum(r.gf-r.ga),0)::int goal_difference,
  (count(*) filter (where r.gf > r.ga) * s.win_points +
   count(*) filter (where r.gf = r.ga) * s.draw_points +
   count(*) filter (where r.gf < r.ga) * s.loss_points)::int points
from public.hockey_teams t join public.hockey_seasons s on s.id = t.season_id
left join results r on r.season_id = t.season_id and r.team_id = t.id
group by t.season_id,t.id,t.name,t.logo_url,t.pool,s.win_points,s.draw_points,s.loss_points;

alter table public.hockey_seasons enable row level security;
alter table public.hockey_teams enable row level security;
alter table public.hockey_players enable row level security;
alter table public.hockey_matches enable row level security;
alter table public.hockey_match_events enable row level security;
alter table public.hockey_announcements enable row level security;

create policy "read hockey seasons" on public.hockey_seasons for select using (true);
create policy "admin hockey seasons" on public.hockey_seasons for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read hockey teams" on public.hockey_teams for select using (true);
create policy "admin hockey teams" on public.hockey_teams for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read hockey players" on public.hockey_players for select using (true);
create policy "admin hockey players" on public.hockey_players for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read hockey matches" on public.hockey_matches for select using (true);
create policy "admin hockey matches" on public.hockey_matches for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read hockey events" on public.hockey_match_events for select using (true);
create policy "admin hockey events" on public.hockey_match_events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read published hockey announcements" on public.hockey_announcements for select using (is_published or public.is_admin());
create policy "admin hockey announcements" on public.hockey_announcements for all to authenticated using (public.is_admin()) with check (public.is_admin());

grant select on public.hockey_seasons,public.hockey_teams,public.hockey_players,public.hockey_matches,public.hockey_match_events,public.hockey_announcements,public.hockey_standings to anon,authenticated;
grant insert,update,delete on public.hockey_seasons,public.hockey_teams,public.hockey_players,public.hockey_matches,public.hockey_match_events,public.hockey_announcements to authenticated;

create or replace function public.hockey_control_match(p_match_id uuid, p_action text, p_team_id uuid default null)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches; next_status text; event_name text;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  select * into m from public.hockey_matches where id = p_match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if p_action = 'start' and m.status = 'Upcoming' then
    update public.hockey_matches set status='Live',started_at=now() where id=m.id returning * into m; event_name := 'Started';
  elsif p_action = 'end' and m.status = 'Live' then
    update public.hockey_matches set status='Completed',completed_at=now() where id=m.id returning * into m; event_name := 'Completed';
  elsif p_action in ('home_goal','away_goal','home_undo','away_undo') and m.status = 'Live' then
    if p_team_id is distinct from (case when p_action like 'home_%' then m.home_team_id else m.away_team_id end) then raise exception 'Team does not match action'; end if;
    if p_action = 'home_goal' then update public.hockey_matches set home_score=home_score+1 where id=m.id returning * into m;
    elsif p_action = 'away_goal' then update public.hockey_matches set away_score=away_score+1 where id=m.id returning * into m;
    elsif p_action = 'home_undo' and m.home_score > 0 then update public.hockey_matches set home_score=home_score-1 where id=m.id returning * into m;
    elsif p_action = 'away_undo' and m.away_score > 0 then update public.hockey_matches set away_score=away_score-1 where id=m.id returning * into m;
    else raise exception 'Score cannot be negative'; end if;
    event_name := case when p_action like '%undo' then 'Goal Removed' else 'Goal' end;
  elsif p_action in ('postpone','cancel') and m.status in ('Upcoming','Live') then
    next_status := case when p_action='postpone' then 'Postponed' else 'Cancelled' end;
    update public.hockey_matches set status=next_status where id=m.id returning * into m; event_name := next_status;
  else raise exception 'Action % is invalid for % match',p_action,m.status;
  end if;
  insert into public.hockey_match_events(match_id,season_id,team_id,event_type) values(m.id,m.season_id,p_team_id,event_name);
  return m;
end $$;

create or replace function public.hockey_correct_result(p_match_id uuid,p_home_score int,p_away_score int)
returns public.hockey_matches language plpgsql security invoker set search_path = public, pg_temp as $$
declare m public.hockey_matches;
begin
  if not public.is_admin() then raise exception 'Admin access required'; end if;
  if p_home_score < 0 or p_away_score < 0 then raise exception 'Scores cannot be negative'; end if;
  update public.hockey_matches set home_score=p_home_score,away_score=p_away_score
    where id=p_match_id and status='Completed' returning * into m;
  if not found then raise exception 'Only completed results can be corrected'; end if;
  insert into public.hockey_match_events(match_id,season_id,event_type,note)
    values(m.id,m.season_id,'Corrected',format('Result corrected to %s-%s',p_home_score,p_away_score));
  return m;
end $$;
revoke all on function public.hockey_control_match(uuid,text,uuid) from public,anon;
revoke all on function public.hockey_correct_result(uuid,int,int) from public,anon;
grant execute on function public.hockey_control_match(uuid,text,uuid),public.hockey_correct_result(uuid,int,int) to authenticated;

insert into public.hockey_seasons(slug,name) values('anjk-3','ANJK 3') on conflict (slug) do nothing;
notify pgrst, 'reload schema';
commit;
