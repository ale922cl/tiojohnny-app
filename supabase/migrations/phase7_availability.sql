-- ============================================================
-- Availability: "Disponible ahora" toggle + weekly schedule
-- One jsonb column holds the model's choice:
--   { "mode":"manual",   "on":true }
--   { "mode":"schedule", "hours": { "mon": {"on":true,"from":"20:00","to":"01:00"}, ... } }
-- ============================================================

alter table public.talents
  add column if not exists availability jsonb;
