// Log a content upload so we can rank talents by recent activity.
// Fire-and-forget; never blocks or throws into the caller.
export async function logActivity(sb, talentId, kind) {
  if (!sb || !talentId || !kind) return;
  try {
    await sb.from("talent_activity").insert([{ talent_id: talentId, kind }]);
  } catch (_) {
    /* non-critical */
  }
}
