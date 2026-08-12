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
  } catch {
    return false;
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });
}

function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const rnd = new Uint32Array(8);
  globalThis.crypto.getRandomValues(rnd);
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[rnd[i] % chars.length];
  return `Tio-${s}`;
}

export async function POST(req) {
  if (!isAllowedOrigin(req)) return json({ error: "FORBIDDEN" }, 403);

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_KEY) return json({ error: "NOT_CONFIGURED", message: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." }, 503);

  // Verify caller is a logged-in admin
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

  // Input
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const talentId = body?.talentId;
  if (!talentId) return json({ error: "MISSING_TALENT" }, 400);

  // Talent must exist and already have a linked account
  const { data: talent } = await svc.from("talents").select("id, owner_id, name").eq("id", talentId).maybeSingle();
  if (!talent) return json({ error: "TALENT_NOT_FOUND" }, 404);
  if (!talent.owner_id) return json({ error: "NO_ACCOUNT", message: "Este perfil aún no tiene acceso al portal." }, 409);

  // Reset the password + force a change on next login
  const password = genPassword();
  const { error: upErr } = await svc.auth.admin.updateUserById(talent.owner_id, {
    password,
    user_metadata: { must_change_password: true },
  });
  if (upErr) return json({ error: "RESET_FAILED", message: upErr.message }, 500);

  // Email (for the WhatsApp message) — from the private table, fallback to auth
  let email = "";
  const { data: tp } = await svc.from("talent_private").select("email").eq("talent_id", talentId).maybeSingle();
  email = tp?.email || "";
  if (!email) {
    const { data: au } = await svc.auth.admin.getUserById(talent.owner_id);
    email = au?.user?.email || "";
  }

  return json({ ok: true, reset: true, name: talent.name, email, password, portalUrl: "https://tiojohnny.cl/portal" }, 200);
}
