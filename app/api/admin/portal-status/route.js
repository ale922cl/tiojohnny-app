import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SUPABASE_URL = "https://ktnuedojmitfwoeugefx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnVlZG9qbWl0ZndvZXVnZWZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MjYwMDcsImV4cCI6MjA5MTUwMjAwN30.x85014xsGKhIZji8GU4KqBA-8rPksgSJJBkRSkG4UPE";

const ALLOWED_HOST_SUFFIXES = ["tiojohnny.cl", ".vercel.app", "localhost"];
function isAllowedOrigin(req) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return ALLOWED_HOST_SUFFIXES.some((s) => host === s || host.endsWith(s));
  } catch { return false; }
}
function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

export async function POST(req) {
  if (!isAllowedOrigin(req)) return json({ error: "FORBIDDEN" }, 403);
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_KEY) return json({ error: "NOT_CONFIGURED" }, 503);

  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "UNAUTHENTICATED" }, 401);
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: { user }, error: uErr } = await userClient.auth.getUser();
  if (uErr || !user) return json({ error: "UNAUTHENTICATED" }, 401);

  const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { data: adminRow } = await svc.from("admins").select("role").eq("user_id", user.id).maybeSingle();
  if (!adminRow || adminRow.role !== "admin") return json({ error: "FORBIDDEN" }, 403);

  // List all auth users (paginated) and build a status map keyed by user id.
  const status = {};
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return json({ error: "LIST_FAILED", message: error.message }, 500);
    const users = data?.users || [];
    for (const u of users) {
      status[u.id] = {
        activated: !u.user_metadata?.must_change_password, // cleared once she sets her own password
        hasSignedIn: !!u.last_sign_in_at,
        lastSignInAt: u.last_sign_in_at || null,
      };
    }
    if (users.length < 1000) break;
  }

  return json({ ok: true, status }, 200);
}
