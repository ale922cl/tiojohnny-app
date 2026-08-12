-- ============================================================
-- PHASE 2 — Auth foundation: admin vs. model roles + ownership
-- Run this in the Supabase SQL Editor. It is idempotent and
-- wrapped in a transaction (all-or-nothing).
--
-- Why: until now "authenticated == admin". Once models get their
-- own logins (Phase 3), that would let any model edit anyone's
-- data. This introduces a real admin/model boundary enforced by
-- the database itself, plus an owner link on each profile.
-- ============================================================

begin;

-- 1) Admins registry + role helpers ---------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'admin' check (role in ('admin', 'analytics')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins see own row" on public.admins;
create policy "admins see own row" on public.admins
  for select to authenticated using (user_id = auth.uid());

-- is_admin(): full admin — may write everything.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid() and role = 'admin');
$$;

-- is_staff(): admin OR analytics — read-only analytics access.
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Only full admins can manage the admins table.
drop policy if exists "admins manage admins" on public.admins;
create policy "admins manage admins" on public.admins
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Seed: every EXISTING auth user is staff today (no model logins yet).
-- The analytics-only account keeps its restricted role; everyone else = admin.
insert into public.admins (user_id, role)
select id,
       case when lower(email) = 'aceitunoafarica@hotmail.com' then 'analytics' else 'admin' end
from auth.users
on conflict (user_id) do nothing;

-- 2) Ownership on talents -------------------------------------
alter table public.talents
  add column if not exists owner_id uuid references auth.users(id) on delete set null;

-- 3) RLS rewrite — role-aware ---------------------------------

-- talents: public read; anon can register; owner OR admin edits; admin deletes
alter table public.talents enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='talents'
  loop execute format('drop policy %I on public.talents', p.policyname); end loop;
end $$;
create policy "talents public read" on public.talents
  for select to anon, authenticated using (true);
create policy "talents register" on public.talents
  for insert to anon, authenticated with check (true);
create policy "talents owner or admin update" on public.talents
  for update to authenticated
  using (public.is_admin() or auth.uid() = owner_id)
  with check (public.is_admin() or auth.uid() = owner_id);
create policy "talents admin delete" on public.talents
  for delete to authenticated using (public.is_admin());

-- ads: public read; admin write
alter table public.ads enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='ads'
  loop execute format('drop policy %I on public.ads', p.policyname); end loop;
end $$;
create policy "ads public read" on public.ads
  for select to anon, authenticated using (true);
create policy "ads admin write" on public.ads
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- categories: public read; admin write
alter table public.categories enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='categories'
  loop execute format('drop policy %I on public.categories', p.policyname); end loop;
end $$;
create policy "categories public read" on public.categories
  for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- chat_sessions: anon insert/update (visitor chat); admin read/delete
alter table public.chat_sessions enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='chat_sessions'
  loop execute format('drop policy %I on public.chat_sessions', p.policyname); end loop;
end $$;
create policy "chat insert" on public.chat_sessions
  for insert to anon, authenticated with check (true);
create policy "chat update" on public.chat_sessions
  for update to anon, authenticated using (true) with check (true);
create policy "chat admin read" on public.chat_sessions
  for select to authenticated using (public.is_admin());
create policy "chat admin delete" on public.chat_sessions
  for delete to authenticated using (public.is_admin());

-- event_requests: anon insert (booking); admin read/update/delete
alter table public.event_requests enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='event_requests'
  loop execute format('drop policy %I on public.event_requests', p.policyname); end loop;
end $$;
create policy "events insert" on public.event_requests
  for insert to anon, authenticated with check (true);
create policy "events admin read" on public.event_requests
  for select to authenticated using (public.is_admin());
create policy "events admin update" on public.event_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "events admin delete" on public.event_requests
  for delete to authenticated using (public.is_admin());

-- analytics_events: anon insert (tracking); staff read
alter table public.analytics_events enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='analytics_events'
  loop execute format('drop policy %I on public.analytics_events', p.policyname); end loop;
end $$;
create policy "analytics insert" on public.analytics_events
  for insert to anon, authenticated with check (true);
create policy "analytics staff read" on public.analytics_events
  for select to authenticated using (public.is_staff());

-- storage (talent-photos bucket): public read; anon+authed upload
-- (never into ads/ unless admin); admin delete.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='storage' and tablename='objects'
  loop execute format('drop policy %I on storage.objects', p.policyname); end loop;
end $$;
create policy "photos public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'talent-photos');
create policy "photos anon upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'talent-photos' and name not like 'ads/%');
create policy "photos authed upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'talent-photos' and (public.is_admin() or name not like 'ads/%'));
create policy "photos admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'talent-photos' and public.is_admin());

commit;

-- ============================================================
-- VERIFY (run separately after the migration):
--   select a.role, u.email
--   from public.admins a join auth.users u on u.id = a.user_id
--   order by a.role, u.email;
-- Your admin email should show role = 'admin'.
-- ============================================================
