import { notFound } from "next/navigation";
import { fetchActiveTalents, categoriesWithCounts } from "@/lib/landing";
import LandingGrid from "@/components/LandingGrid";

export const revalidate = 3600;
const SITE = "https://tiojohnny.cl";

async function resolve(slug) {
  const talents = await fetchActiveTalents();
  return categoriesWithCounts(talents).find((c) => c.slug === slug) || null;
}

export async function generateMetadata({ params }) {
  const c = await resolve(params.cat);
  if (!c) return { title: "Modelos | TioJohnny.cl", robots: { index: false } };
  const title = `${c.name} — Modelos y Talentos para Eventos | TioJohnny.cl`;
  const desc = `${c.name}: ${c.count} perfil${c.count !== 1 ? "es" : ""} de modelos y talentos para eventos en Chile. Verificados y con contacto directo por WhatsApp.`.slice(0, 160);
  const url = `${SITE}/categoria/${c.slug}`;
  const img = c.talents[0]?.photos?.find(Boolean);
  return {
    title, description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: "TioJohnny.cl", locale: "es_CL", images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title, description: desc, images: img ? [img] : undefined },
  };
}

export default async function CategoriaPage({ params }) {
  const c = await resolve(params.cat);
  if (!c) notFound();
  const intro = `Modelos y talentos en la categoría ${c.name} para tus eventos en Chile. Explora perfiles verificados para fiestas privadas, despedidas, eventos corporativos y más — contacto directo por WhatsApp en TioJohnny.cl.`;
  return <LandingGrid heading={`${c.name}`} intro={intro} talents={c.talents} />;
}
