import { fetchActiveTalents, comunasWithCounts, categoriesWithCounts, EVENT_TYPES } from "@/lib/landing";
import { modeloPath } from "@/lib/seo";

const SITE = "https://tiojohnny.cl";
export const revalidate = 3600;

export default async function sitemap() {
  const home = [{ url: `${SITE}/`, changeFrequency: "daily", priority: 1.0 }];
  try {
    const talents = await fetchActiveTalents();
    const comunas = comunasWithCounts(talents).map((c) => ({
      url: `${SITE}/modelos/${c.slug}`, changeFrequency: "weekly", priority: 0.7,
    }));
    const cats = categoriesWithCounts(talents).map((c) => ({
      url: `${SITE}/categoria/${c.slug}`, changeFrequency: "weekly", priority: 0.7,
    }));
    const events = Object.keys(EVENT_TYPES).map((tipo) => ({
      url: `${SITE}/eventos/${tipo}`, changeFrequency: "monthly", priority: 0.7,
    }));
    const profiles = talents.map((t) => ({
      url: `${SITE}${modeloPath(t)}`, changeFrequency: "weekly", priority: 0.8,
    }));
    return [...home, ...comunas, ...cats, ...events, ...profiles];
  } catch {
    return home;
  }
}
