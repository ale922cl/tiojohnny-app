-- ============================================================
-- PHASE 5 — Stories (24h ephemeral, max 5 per talent / 24h)
-- Run BEFORE deploying the Phase 5 code. Idempotent.
-- ============================================================

begin;

create table if not exists public.stories (
  id          uuid primary key default gen_random_uuid(),
  talent_id   bigint not null references public.talents(id) on delete cascade,
  media_url   text not null,
  media_type  text not null check (media_type in ('photo', 'video')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);
create index if not exists stories_active_idx on public.stories (talent_id, expires_at);

alter table public.stories enable row level security;

do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='stories'
  loop execute format('drop policy %I on public.stories', p.policyname); end loop;
end $$;

-- Public sees ONLY non-expired stories (this is what makes them "expire").
create policy "stories public read" on public.stories
  for select to anon, authenticated using (expires_at > now());
-- A model can post for her own profile (admin can post for anyone).
create policy "stories owner insert" on public.stories
  for insert to authenticated
  with check (public.is_admin() or exists (
    select 1 from public.talents t where t.id = talent_id and t.owner_id = auth.uid()));
-- A model can delete her own stories (admin can delete any).
create policy "stories owner delete" on public.stories
  for delete to authenticated
  using (public.is_admin() or exists (
    select 1 from public.talents t where t.id = talent_id and t.owner_id = auth.uid()));

-- Hard cap: max 5 stories per talent per rolling 24h (enforced in DB).
create or replace function public.enforce_story_limit() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.stories
      where talent_id = new.talent_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'STORY_LIMIT';
  end if;
  return new;
end $$;
drop trigger if exists stories_limit on public.stories;
create trigger stories_limit before insert on public.stories
  for each row execute function public.enforce_story_limit();

commit;
