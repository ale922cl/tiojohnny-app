import { createClient } from "@supabase/supabase-js";

// Public project URL + anon key (safe to ship in the client — row-level
// security is what protects the data). Same project the main app uses.
export const SUPABASE_URL = "https://ktnuedojmitfwoeugefx.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnVlZG9qbWl0ZndvZXVnZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjYwMDcsImV4cCI6MjA5MTUwMjAwN30.x85014xsGKhIZji8GU4KqBA-8rPksgSJJBkRSkG4UPE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
