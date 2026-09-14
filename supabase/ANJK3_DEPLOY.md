# ANJK 3 deployment

1. In the existing Supabase project, ensure the `public.is_admin()` helper and `AppUsers` admin role policies from `rls.sql` or `security-hardening-2026-08.sql` are already installed. Do not replace existing Sports tables.
2. Run `migrations/20260914_anjk_hockey_seasons.sql` once in the Supabase SQL editor or through the project's migration process. It creates the `ANJK 3` season record, but intentionally seeds no teams, fixtures or scores.
3. Optionally run `tests/hockey_standings.sql` in the SQL editor after migration. It checks draw, win, loss, goal difference, postponed/cancelled exclusion, knockout exclusion and result correction; its transaction rolls back test data.
4. Deploy the React build to Netlify using the existing `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` environment variables. The existing SPA redirect handles `/anjk-3` and `/admin/anjk-3`.
5. Sign in with an existing Admin account. Open `/admin/anjk-3` to enter dates, venue, poster, teams, pools, fixtures and announcements. Use **Match Control** to start, score and end fixtures. Standings are a database view and update automatically from completed Group/League matches.

For a future season, open `/admin/tournaments/<slug>` to create its record, then share `/tournaments/<slug>` as its public page. The ANJK 3 main menu and Home panel continue to point to the ANJK 3 record.
