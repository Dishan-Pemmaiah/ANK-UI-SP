-- Apply after the base hockey schema. Existing fixtures get an empty public note.
alter table public.hockey_matches
  add column if not exists match_note text not null default '';

comment on column public.hockey_matches.match_note is
  'Public match update, such as rain delay, sudden death, or tie-breaker outcome.';
