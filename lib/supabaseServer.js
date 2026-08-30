import { createClient } from "@supabase/supabase-js";

// Server-side anon client (no session persistence) for SSR reads.
export const SUPABASE_URL = "https://ktnuedojmitfwoeugefx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnVlZG9qbWl0ZndvZXVnZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjYwMDcsImV4cCI6MjA5MTUwMjAwN30.x85014xsGKhIZji8GU4KqBA-8rPksgSJJBkRSkG4UPE";

export function supabaseServer() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
