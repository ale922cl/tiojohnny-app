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

// Readable temp password, e.g. "Tio-7k4mQ2" — avoids ambiguous chars.
function genPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const rnd = new Uint32Array(8);
  globalThis.crypto.getRandomValues(rnd);
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[rnd[i] % chars.length];
  return `Tio-${s}`;
}

const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function POST(req) {
  if (!isAllowedOrigin(req)) return json({ error: "FORBIDDEN" }, 403);

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SERVICE_KEY) {
    return json({ error: "NOT_CONFIGURED", message: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." }, 503);
  }

  // 1) Verify the caller is a logged-in admin
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

  // 2) Validate input
  let body;
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const talentId = body?.talentId;
  const email = String(body?.email || "").trim().toLowerCase();
  if (!talentId) return json({ error: "MISSING_TALENT" }, 400);
  if (!emailOk(email)) return json({ error: "BAD_EMAIL", message: "Email inválido." }, 400);

  // 3) Talent must exist and not already have access
  const { data: talent, error: tErr } = await svc
    .from("talents").select("id, owner_id, name").eq("id", talentId).maybeSingle();
  if (tErr || !talent) return json({ error: "TALENT_NOT_FOUND" }, 404);
  if (talent.owner_id) return json({ error: "ALREADY_LINKED", message: "Este perfil ya tiene acceso al portal." }, 409);

  // 4) Create the auth user (confirmed so she can log in immediately)
  const password = genPassword();
  const { data: created, error: cErr } = await svc.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (cErr || !created?.user) {
    const msg = /already/i.test(cErr?.message || "")
      ? "Ya existe una cuenta con ese email."
      : (cErr?.message || "No se pudo crear la cuenta.");
    return json({ error: "CREATE_FAILED", message: msg }, 400);
  }

  // 5) Link the account to this profile + store email privately
  const { error: linkErr } = await svc
    .from("talents").update({ owner_id: created.user.id }).eq("id", talentId);
  if (linkErr) {
    // Roll back the orphan auth user so a retry can succeed
    await svc.auth.admin.deleteUser(created.user.id).catch(() => {});
    return json({ error: "LINK_FAILED", message: linkErr.message }, 500);
  }
  await svc.from("talent_private").upsert({ talent_id: talentId, email }, { onConflict: "talent_id" });

  return json({
    ok: true,
    name: talent.name,
    email,
    password,
    portalUrl: "https://tiojohnny.cl/portal",
  }, 200);
}
