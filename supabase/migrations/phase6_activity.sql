-- ============================================================
-- Activity tracking → "Modelo de la semana" + dynamic ordering
-- Logs every content upload (story/photo/video) so we can rank by
-- recent activity even after stories expire. Week starts Monday
-- (Santiago time). Run in the Supabase SQL Editor.
-- ============================================================

begin;

create table if not exists public.talent_activity (
  id         bigint generated always as identity primary key,
  talent_id  bigint references public.talents(id) on delete cascade,
  kind       text not null check (kind in ('story', 'photo', 'video')),
  created_at timestamptz not null default now()
);
create index if not exists talent_activity_tid_idx on public.talent_activity (talent_id);
create index if not exists talent_activity_created_idx on public.talent_activity (created_at);

alter table public.talent_activity enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='talent_activity'
  loop execute format('drop policy %I on public.talent_activity', p.policyname); end loop;
end $$;
-- writes come from the portal (model) and admin; reads are just timestamps (not sensitive)
create policy "activity insert" on public.talent_activity for insert to anon, authenticated with check (true);
create policy "activity read"   on public.talent_activity for select to anon, authenticated using (true);

-- Aggregated scores the public grid reads:
--   week_stories   = stories uploaded since Monday 00:00 (Santiago)
--   activity_score = weighted uploads in the last 7 days (story 3, video 2, photo 1)
create or replace view public.talent_week_activity as
select
  talent_id,
  count(*) filter (
    where kind = 'story'
      and (created_at at time zone 'America/Santiago')
          >= date_trunc('week', now() at time zone 'America/Santiago')
  )::int as week_stories,
  (
      3 * count(*) filter (where kind = 'story' and created_at >= now() - interval '7 days')
    + 2 * count(*) filter (where kind = 'video' and created_at >= now() - interval '7 days')
    + 1 * count(*) filter (where kind = 'photo' and created_at >= now() - interval '7 days')
  )::int as activity_score
from public.talent_activity
group by talent_id;

grant select on public.talent_week_activity to anon, authenticated;

commit;
