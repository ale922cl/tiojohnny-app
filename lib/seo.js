// URL/slug helpers for server-rendered profile pages.

export function slugify(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Readable, unique slug: "valentina-rojas-las-condes-17"
export function modeloSlug(t) {
  const base = slugify(`${t.name || "modelo"} ${t.location || ""}`) || "modelo";
  return `${base}-${t.id}`;
}

export function modeloPath(t) {
  return `/modelo/${modeloSlug(t)}`;
}

// Pull the trailing numeric id out of a slug (or accept a bare id).
export function idFromSlug(slug) {
  const s = String(slug || "");
  const m = s.match(/-(\d+)$/);
  if (m) return Number(m[1]);
  if (/^\d+$/.test(s)) return Number(s);
  return null;
}
