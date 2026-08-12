-- ============================================================
-- EMAIL PRIVACY — Step B (run LAST, only after the new code is live)
-- Removes the publicly-readable email column from talents. After this,
-- email lives ONLY in talent_private (never readable by anon).
-- ============================================================

alter table public.talents drop column if exists email;
