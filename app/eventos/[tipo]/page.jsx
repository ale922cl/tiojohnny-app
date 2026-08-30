import { notFound } from "next/navigation";
import { fetchActiveTalents, EVENT_TYPES } from "@/lib/landing";
import LandingGrid from "@/components/LandingGrid";

export const revalidate = 3600;
const SITE = "https://tiojohnny.cl";

export function generateStaticParams() {
  return Object.keys(EVENT_TYPES).map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }) {
  const cfg = EVENT_TYPES[params.tipo];
  if (!cfg) return { title: "Eventos | TioJohnny.cl", robots: { index: false } };
  const title = `${cfg.h1} | TioJohnny.cl`;
  const desc = cfg.intro.slice(0, 160);
  const url = `${SITE}/eventos/${params.tipo}`;
  return {
    title, description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, siteName: "TioJohnny.cl", locale: "es_CL", images: [{ url: `${SITE}/og-image.png` }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [`${SITE}/og-image.png`] },
  };
}

export default async function EventoPage({ params }) {
  const cfg = EVENT_TYPES[params.tipo];
  if (!cfg) notFound();
  const talents = (await fetchActiveTalents())
    .filter((t) => (t.section || "main") === "main")
    .slice(0, 24);
  return (
    <LandingGrid
      heading={cfg.h1}
      intro={cfg.intro}
      talents={talents}
      ctaLabel="💬 Cotizar tu evento"
      ctaHref="/"
    />
  );
}
