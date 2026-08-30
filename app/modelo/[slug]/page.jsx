import { notFound, redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { idFromSlug, modeloSlug, modeloPath } from "@/lib/seo";

export const revalidate = 3600; // regenerate at most hourly

async function getTalent(slug) {
  const id = idFromSlug(slug);
  if (!id) return null;
  try {
    const { data } = await supabaseServer()
      .from("talents").select("*").eq("id", id).maybeSingle();
    if (!data || data.archived || data.status === "pendiente") return null;
    return data;
  } catch {
    return null;
  }
}

const SITE = "https://tiojohnny.cl";
const clean = (s) => (s || "").toString().trim();

export async function generateMetadata({ params }) {
  const t = await getTalent(params.slug);
  if (!t) return { title: "Modelo no encontrada | TioJohnny.cl", robots: { index: false } };
  const loc = t.location ? ` en ${t.location}` : "";
  const title = `${t.name} — Modelo${loc} | TioJohnny.cl`;
  const desc = (clean(t.about) ||
    `${t.name}, modelo${loc}. ${clean(t.specialty)} Contrata talento para tu evento en TioJohnny.cl.`).slice(0, 160);
  const img = Array.isArray(t.photos) ? t.photos.find(Boolean) : null;
  const url = `${SITE}${modeloPath(t)}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title, description: desc, url, type: "profile", siteName: "TioJohnny.cl", locale: "es_CL",
      images: img ? [{ url: img, alt: t.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description: desc, images: img ? [img] : undefined },
  };
}

export default async function ModeloPage({ params }) {
  const t = await getTalent(params.slug);
  if (!t) notFound();
  // Enforce the canonical slug (avoids duplicate-content URLs)
  const canonical = modeloSlug(t);
  if (params.slug !== canonical) redirect(modeloPath(t));

  const photos = (Array.isArray(t.photos) ? t.photos : []).filter(Boolean);
  const videos = (Array.isArray(t.videos) ? t.videos : []).filter(Boolean);
  const hero = photos[0];
  const phoneDigits = clean(t.phone).replace(/\D/g, "");
  const rate = clean(t.rate).replace(/\s*\/?\s*(hr|hra|hora|h)\b\.?/i, "").trim();
  const waText = encodeURIComponent(`Hola, te vi en TioJohnny.cl y me gustaría saber más de ti`);
  const stats = [
    ["Nacionalidad", t.nationality], ["Edad", t.age], ["Estatura", t.height],
    ["Peso", t.weight], ["Ojos", t.eyes], ["Cabello", t.hair], ["Talla", t.sizes],
  ].filter(([, v]) => clean(v));
  const services = clean(t.experience).split("\n").map((s) => s.trim()).filter(Boolean);

  // A few other models for internal linking (crawl graph + keep browsing)
  let others = [];
  try {
    const { data: rel } = await supabaseServer()
      .from("talents").select("id, name, location, photos, section, archived, status")
      .eq("section", t.section || "main").neq("id", t.id).limit(40);
    others = (rel || []).filter((x) => !x.archived && x.status !== "pendiente" && Array.isArray(x.photos) && x.photos.length).slice(0, 6);
  } catch {}

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: t.name,
    ...(hero ? { image: hero } : {}),
    ...(clean(t.about) ? { description: clean(t.about) } : {}),
    ...(t.location ? { homeLocation: { "@type": "Place", name: `${t.location}, Chile` } } : {}),
    url: `${SITE}${modeloPath(t)}`,
    ...(clean(t.rate) ? {
      makesOffer: { "@type": "Offer", priceCurrency: "CLP", price: clean(t.rate).replace(/[^\d]/g, ""),
        availability: "https://schema.org/InStock",
        itemOffered: { "@type": "Service", name: "Modelo para eventos" } },
    } : {}),
  };

  const card = { background: "#1e1e3a", borderRadius: 16 };

  return (
    <main style={{ minHeight: "100vh", background: "#12122a", color: "#fff", fontFamily: "'Sora', system-ui, sans-serif" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ padding: "14px 18px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: "none" }}>
          <span style={{ color: "#8B5CF6" }}>Tio</span><span style={{ color: "#fff" }}>Johnny</span><span style={{ color: "#6b6b90" }}>.cl</span>
        </a>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 0 120px" }}>
        {/* Hero */}
        <div style={{ position: "relative", width: "100%", aspectRatio: "4/5", maxHeight: "70vh", overflow: "hidden", background: "#0d0d1a" }}>
          {hero && <img src={hero} alt={`${t.name} — modelo${t.location ? ` en ${t.location}` : ""}`} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 45%, #12122a 100%)" }} />
          <div style={{ position: "absolute", bottom: 16, left: 18, right: 18 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{t.name}</h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
              {clean(t.specialty) && <span style={{ color: "#c4c4d8", fontSize: 14 }}>{t.specialty}</span>}
              {t.location && <span style={{ color: "#9898b0", fontSize: 14 }}>📍 {t.location}</span>}
              {rate && <span style={{ color: "#8B5CF6", fontWeight: 700, fontSize: 16 }}>{rate}</span>}
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 16px 0", display: "grid", gap: 16 }}>
          {clean(t.about) && (
            <section style={{ ...card, padding: 16 }}>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 8px" }}>Sobre</h2>
              <p style={{ margin: 0, color: "#c4c4d8", lineHeight: 1.6, fontSize: 15 }}>{t.about}</p>
            </section>
          )}

          {stats.length > 0 && (
            <section style={{ ...card, padding: 16 }}>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 12px" }}>Detalles</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {stats.map(([label, value]) => (
                  <div key={label} style={{ background: "#12122a", borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#7878a0" }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {services.length > 0 && (
            <section style={{ ...card, padding: 16 }}>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 8px" }}>Servicios</h2>
              <ul style={{ margin: 0, paddingLeft: 18, color: "#c4c4d8", lineHeight: 1.7, fontSize: 15 }}>
                {services.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </section>
          )}

          {videos.length > 0 && (
            <section>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 8px" }}>Videos</h2>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {videos.map((url, i) => (
                  <video key={i} src={url} controls playsInline preload="metadata"
                    style={{ width: 200, aspectRatio: "3/4", objectFit: "cover", borderRadius: 12, background: "#000", flexShrink: 0 }} />
                ))}
              </div>
            </section>
          )}

          {photos.length > 1 && (
            <section>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 8px" }}>Galería</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {photos.slice(1).map((url, i) => (
                  <img key={i} src={url} alt={`${t.name} — foto ${i + 2}`} loading="lazy"
                    style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 12 }} />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 8px" }}>Más modelos</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {others.map((x) => (
                  <a key={x.id} href={modeloPath(x)} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ borderRadius: 12, overflow: "hidden", background: "#0d0d1a", aspectRatio: "3/4" }}>
                      <img src={x.photos.find(Boolean)} alt={`${x.name}${x.location ? ` — ${x.location}` : ""}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{x.name}</div>
                    {x.location && <div style={{ fontSize: 11, color: "#7878a0" }}>{x.location}</div>}
                  </a>
                ))}
              </div>
            </section>
          )}

          <a href="/" style={{ textAlign: "center", color: "#8B5CF6", fontSize: 14, textDecoration: "none", padding: "8px 0" }}>
            ← Ver todas las modelos en TioJohnny.cl
          </a>
        </div>
      </div>

      {/* Sticky contact bar */}
      {phoneDigits && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", background: "linear-gradient(to top, #12122a 70%, transparent)", display: "flex", justifyContent: "center" }}>
          <a href={`https://wa.me/${phoneDigits}?text=${waText}`} rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 16, padding: "13px 32px", borderRadius: 999, textDecoration: "none", boxShadow: "0 8px 24px rgba(37,211,102,0.35)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.463 3.488A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.463 3.488" /></svg>
            Contactar por WhatsApp
          </a>
        </div>
      )}
    </main>
  );
}
