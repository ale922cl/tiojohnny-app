import { supabaseServer } from "@/lib/supabaseServer";
import { modeloPath } from "@/lib/seo";

const SITE = "https://tiojohnny.cl";
export const revalidate = 3600;

export default async function sitemap() {
  const base = [{ url: `${SITE}/`, changeFrequency: "daily", priority: 1.0 }];
  try {
    const { data } = await supabaseServer()
      .from("talents")
      .select("id, name, location, archived, status")
      .limit(5000);
    const profiles = (data || [])
      .filter((t) => !t.archived && t.status !== "pendiente")
      .map((t) => ({
        url: `${SITE}${modeloPath(t)}`,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    return [...base, ...profiles];
  } catch {
    return base;
  }
}
