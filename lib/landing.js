import { cache } from "react";
import { supabaseServer } from "./supabaseServer";
import { slugify } from "./seo";

// Fixed set of event-intent landing pages (SEO). Keyed by URL slug.
export const EVENT_TYPES = {
  "despedida-de-soltero": {
    name: "Despedida de Soltero",
    h1: "Modelos para Despedidas de Soltero en Chile",
    intro: "Hazla inolvidable. Modelos, animadoras y talentos para despedidas de soltero en Santiago y todo Chile — perfiles verificados, contacto directo por WhatsApp y cotización al instante.",
  },
  "despedida-de-soltera": {
    name: "Despedida de Soltera",
    h1: "Talentos para Despedidas de Soltera en Chile",
    intro: "Celebra a lo grande. Vedettos, modelos y animadores para despedidas de soltera en Santiago y todo Chile. Perfiles verificados y contacto directo por WhatsApp.",
  },
  "eventos-corporativos": {
    name: "Eventos Corporativos",
    h1: "Modelos y Anfitrionas para Eventos Corporativos en Chile",
    intro: "Modelos, anfitrionas y talentos para eventos corporativos, lanzamientos de producto, ferias y activaciones de marca en Chile. Imagen profesional, reserva fácil por WhatsApp.",
  },
  "fiestas-privadas": {
    name: "Fiestas Privadas",
    h1: "Modelos y Animadoras para Fiestas Privadas en Chile",
    intro: "Modelos y animadoras para fiestas privadas en Santiago y todo Chile. Perfiles verificados, cotización al instante y contacto directo por WhatsApp.",
  },
  "cumpleanos": {
    name: "Cumpleaños",
    h1: "Modelos y Talentos para Cumpleaños en Chile",
    intro: "Sorprende en el cumpleaños. Modelos, animadoras y talentos para celebraciones en Santiago y todo Chile. Perfiles verificados y contacto directo por WhatsApp.",
  },
  "desfiles-y-pasarelas": {
    name: "Desfiles y Pasarelas",
    h1: "Modelos para Desfiles y Pasarelas en Chile",
    intro: "Modelos profesionales para desfiles, pasarelas y presentaciones de moda en Chile. Perfiles verificados, reserva directa por WhatsApp.",
  },
  "sesiones-fotograficas": {
    name: "Sesiones Fotográficas",
    h1: "Modelos para Sesiones Fotográficas en Chile",
    intro: "Modelos para sesiones fotográficas, campañas y producciones en Santiago y todo Chile. Perfiles verificados y contacto directo por WhatsApp.",
  },
};

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
