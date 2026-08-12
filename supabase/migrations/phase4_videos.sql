-- ============================================================
-- PHASE 4 — Videos on profiles
-- Adds a videos array to talents (parallel to photos). Safe/additive.
-- Run BEFORE deploying the Phase 4 code.
-- ============================================================

alter table public.talents
  add column if not exists videos jsonb not null default '[]'::jsonb;
