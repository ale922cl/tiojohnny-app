import { cache } from "react";
import { supabaseServer } from "./supabaseServer";
import { slugify } from "./seo";

// Fetch all publicly-visible talents once per request (memoized).
export const fetchActiveTalents = cache(async () => {
  try {
    const { data } = await supabaseServer()
      .from("talents")
      .select("id, name, location, photos, category, section, rate, specialty, archived, status")
      .limit(5000);
    return (data || []).filter(
      (t) => !t.archived && t.status !== "pendiente" && Array.isArray(t.photos) && t.photos.length
    );
  } catch {
    return [];
  }
});

// Group active talents by comuna (only comunas that actually have models).
export function comunasWithCounts(talents) {
  const m = new Map();
  for (const t of talents) {
    const name = (t.location || "").trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug) continue;
    if (!m.has(slug)) m.set(slug, { slug, name, count: 0, talents: [] });
    const e = m.get(slug);
    e.count++;
    e.talents.push(t);
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}

// Group active talents by category (only categories that have models).
export function categoriesWithCounts(talents) {
  const m = new Map();
  for (const t of talents) {
    const cats = Array.isArray(t.category) ? t.category : [];
    for (const c of cats) {
      const name = (c || "").trim();
      if (!name) continue;
      const slug = slugify(name);
      if (!slug) continue;
      if (!m.has(slug)) m.set(slug, { slug, name, count: 0, talents: [] });
      const e = m.get(slug);
      e.count++;
      e.talents.push(t);
    }
  }
  return [...m.values()].sort((a, b) => b.count - a.count);
}
