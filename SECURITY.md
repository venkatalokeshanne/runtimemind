# Security & API Key Checklist

This document explains how to handle Supabase API keys securely for this project.

1. Rotate leaked keys immediately
   - If any API key is exposed, go to Supabase → Project → Settings → API and click "Regenerate" for the key.
   - If a `service_role` key leaks, rotate it first and assume compromise.

2. Environment variables
   - Local development: copy `.env.example` to `.env.local` and fill values. Do NOT commit `.env.local`.
   - Set the following variables in `.env.local` (example):
     ```ini
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...              # safe in browser only with RLS
     SUPABASE_SERVICE_ROLE_KEY=sk-...                 # server-only secret
     ```

3. Where to store keys in deployment
   - Vercel / Netlify / Render / Fly / Heroku: use the platform's Environment Variables/Secrets UI.
   - GitHub Actions: add secrets under Repository → Settings → Secrets → Actions.
   - Never hard-code keys in source code or commit them to the repository.

4. Use least privilege
   - Enable Row Level Security (RLS) on tables and add strict policies for public/anon users.
   - Use `service_role` for admin-only server tasks. Prefer scoped RPCs over granting wide permissions.

5. Audit & cleanup
   - Search the repo for accidentally committed keys and rotate any found.
   - Remove keys from PRs and issue comments. Use `git filter-repo` or `git filter-branch` to rewrite history if necessary.

6. Quick responses
   - If a key leaks publicly: rotate, remove, and audit logs for suspicious activity.

7. Contact
   - For help rotating keys or applying RLS policies, ask here and I can implement guidance or patches.
