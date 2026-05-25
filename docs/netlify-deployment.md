# Netlify Deployment

This project should run from GitHub through Netlify, not from a local dev server.

## Netlify Setup

1. In Netlify, create a new site from Git.
2. Select the GitHub repository: `EnochTse/Clayos-System`.
3. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add these environment variables in Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL`

`NEXT_PUBLIC_APP_URL` must be the deployed Netlify site URL, for example:

```env
NEXT_PUBLIC_APP_URL=https://clayos-system.netlify.app
```

## Supabase Auth Settings

In Supabase, go to `Authentication` -> `URL Configuration`.

Set:

```txt
Site URL:
https://your-netlify-site.netlify.app

Redirect URLs:
https://your-netlify-site.netlify.app/auth/callback
```

Also run every new SQL migration in the Supabase SQL Editor before testing deployed features.

## Current Required Migration

Run this file in Supabase SQL Editor:

```txt
supabase/migrations/0002_auth_profile_bootstrap.sql
```
