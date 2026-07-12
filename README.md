# ANJK UI (Supabase-Only)

This is a separate UI-only repository for ANJK that connects directly to Supabase Auth + Postgres tables, without the Render API layer.

## What is included

- Supabase Auth-based login/register/profile
- Direct table reads/writes for ANJK pages (News, Events, Gallery, Sports, About, Committee, Heritage, Villages, Live)
- RLS policy script for the same ANJK tables in `supabase/rls.sql`
- Netlify-ready static frontend

## Environment variables

Copy `.env.example` to `.env` and fill values:

```env
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Local run

```bash
npm install
npm start
```

## Production build

```bash
npm run build
```

## Supabase setup

1. Open Supabase SQL Editor.
2. Run `supabase/rls.sql`.
3. Confirm RLS is enabled and policies are created.

## Netlify deploy settings

- Base directory: repository root of this project
- Build command: `npm ci && npm run build`
- Publish directory: `build`
- Environment variables:
	- `REACT_APP_SUPABASE_URL`
	- `REACT_APP_SUPABASE_ANON_KEY`

## Create a new GitHub repository

From this folder, run:

```bash
git init
git add .
git commit -m "Initial Supabase-only ANJK UI"
git branch -M main
git remote add origin https://github.com/<your-user>/<new-repo>.git
git push -u origin main
```

If you have GitHub CLI authenticated, you can create and push in one flow:

```bash
gh repo create <new-repo> --public --source . --remote origin --push
```
