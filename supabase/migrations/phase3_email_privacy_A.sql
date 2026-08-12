-- ============================================================
-- EMAIL PRIVACY — Step A (run FIRST, before deploying the code)
-- Moves talent email into a private table that anon can never read.
-- Safe/additive: the old talents.email column is left in place until
-- Step B (dropped only after the new code is live).
-- ============================================================

begin;

create table if not exists public.talent_private (
  talent_id  bigint primary key references public.talents(id) on delete cascade,
  email      text,
  updated_at timestamptz not null default now()
);

alter table public.talent_private enable row level security;

-- Move any emails already stored on talents into the private table.
insert into public.talent_private (talent_id, email)
select id, email from public.talents where email is not null and email <> ''
on conflict (talent_id) do update set email = excluded.email;

-- Policies
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='talent_private'
  loop execute format('drop policy %I on public.talent_private', p.policyname); end loop;
end $$;

-- Anyone can write during registration / self-serve (talent_id + email).
create policy "tp insert" on public.talent_private
  for insert to anon, authenticated with check (true);
-- Admins can read/update/delete everything.
create policy "tp admin all" on public.talent_private
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
-- The owning model can read her own email.
create policy "tp owner read" on public.talent_private
  for select to authenticated
  using (exists (select 1 from public.talents t where t.id = talent_id and t.owner_id = auth.uid()));

commit;
