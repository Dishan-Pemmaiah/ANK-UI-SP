# ANJK 3 deployment

1. In the existing Supabase project, ensure the `public.is_admin()` helper and `AppUsers` admin role policies from `rls.sql` or `security-hardening-2026-08.sql` are already installed. Do not replace existing Sports tables.
2. Run `migrations/20260914_anjk_hockey_seasons.sql` once if it has not yet been installed. Then run `migrations/20260914_anjk_hockey_match_control_followup.sql`, followed by `migrations/20260914_anjk_hockey_reschedule_history_fix.sql`. If the first two were already applied, run only the repair migration. The migrations preserve legacy tables and existing hockey records. If a season already has multiple live matches, end or postpone the extras before relying on the one-live-match rule.
3. Optionally run `tests/hockey_standings.sql` and `tests/hockey_match_control.sql` in the SQL editor after all migrations. They check standings and the admin match lifecycle. Both use transactions that roll back test data; run them with a database owner connection, not from the public app.
4. Deploy the React build to Netlify using the existing `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` environment variables. The existing SPA redirect handles `/anjk-3` and `/admin/anjk-3`.
5. Sign in with an existing Admin account. Open `/admin/anjk-3` to enter dates, venue, poster, teams, optional players, pools, fixtures and published/draft announcements. Use **Match Control** to start, score (optionally credit a player), change phase and end fixtures. Standings are a database view and update automatically from completed Group/League matches.

For a future season, open `/admin/tournaments/<slug>` to create its record, then share `/tournaments/<slug>` as its public page. The ANJK 3 main menu and Home panel continue to point to the ANJK 3 record.
