import { notFound } from "next/navigation";
import { fetchActiveTalents, comunasWithCounts } from "@/lib/landing";
import LandingGrid from "@/components/LandingGrid";

export const revalidate = 3600;
const SITE = "https://tiojohnny.cl";

async function resolve(slug) {
  const talents = await fetchActiveTalents();
  return comunasWithCounts(talents).find((c) => c.slug === slug) || null;
}

export async function generateMetadata({ params }) {
  const c = await resolve(params.comuna);
  if (!c) return { title: "Modelos | TioJohnny.cl", robots: { index: false } };
  const title = `Modelos en ${c.name} | TioJohnny.cl`;
  const desc = `${c.count} modelo${c.count !== 1 ? "s" : ""} y talentos para eventos en ${c.name}. Perfiles verificados para fiestas privadas, despedidas y eventos corporativos. Contacto directo por WhatsApp.`.slice(0, 160);
  const url = `${SITE}/modelos/${c.slug}`;
  const img = c.talents[0]?.photos?.find(Boolean);
  return {
    title, description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: "TioJohnny.cl", locale: "es_CL", images: img ? [{ url: img }] : undefined },
    twitter: { card: "summary_large_image", title, description: desc, images: img ? [img] : undefined },
  };
}

export default async function ComunaPage({ params }) {
  const c = await resolve(params.comuna);
  if (!c) notFound();
  const intro = `Encuentra modelos y talentos para eventos en ${c.name}. Perfiles verificados para fiestas privadas, despedidas de soltero/a, eventos corporativos y sesiones fotográficas — contáctalas directo por WhatsApp en TioJohnny.cl.`;
  return <LandingGrid heading={`Modelos en ${c.name}`} intro={intro} talents={c.talents} />;
}
