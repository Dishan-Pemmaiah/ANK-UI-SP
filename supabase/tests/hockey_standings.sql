-- Run after 20260914_anjk_hockey_seasons.sql with a database owner connection.
-- Transaction rolls back all test data.
begin;
do $$
declare s uuid; a uuid; b uuid; c uuid; row_a record; row_b record;
begin
  insert into public.hockey_seasons(slug,name) values('hockey-test-' || substr(gen_random_uuid()::text,1,8),'Hockey test') returning id into s;
  insert into public.hockey_teams(season_id,name,pool) values(s,'A','A') returning id into a;
  insert into public.hockey_teams(season_id,name,pool) values(s,'B','A') returning id into b;
  insert into public.hockey_teams(season_id,name,pool) values(s,'C','A') returning id into c;
  insert into public.hockey_matches(season_id,home_team_id,away_team_id,scheduled_at,pool,stage,status,home_score,away_score)
    values(s,a,b,now(),'A','Group','Completed',3,1),
          (s,a,c,now(),'A','Group','Completed',2,2),
          (s,b,c,now(),'A','Group','Postponed',9,0),
          (s,b,c,now(),'A','Group','Cancelled',8,0),
          (s,a,b,now(),'','Final','Completed',5,0);
  select * into row_a from public.hockey_standings where season_id=s and team_id=a;
  select * into row_b from public.hockey_standings where season_id=s and team_id=b;
  if row_a.played <> 2 or row_a.won <> 1 or row_a.drawn <> 1 or row_a.lost <> 0
    or row_a.goals_for <> 5 or row_a.goals_against <> 3 or row_a.goal_difference <> 2 or row_a.points <> 4 then
    raise exception 'Home win, draw, goal difference or knockout exclusion failed: %',row_a;
  end if;
  if row_b.played <> 1 or row_b.lost <> 1 or row_b.goal_difference <> -2 or row_b.points <> 0 then
    raise exception 'Away loss or postponed/cancelled exclusion failed: %',row_b;
  end if;
  update public.hockey_matches set home_score=1,away_score=1
    where season_id=s and home_team_id=a and away_team_id=b and stage='Group';
  select * into row_a from public.hockey_standings where season_id=s and team_id=a;
  if row_a.points <> 2 or row_a.drawn <> 2 or row_a.goal_difference <> 0 then
    raise exception 'Corrected result did not recalculate standings: %',row_a;
  end if;
end $$;
rollback;
