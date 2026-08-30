import TalentCards from "./TalentCards";
import { EVENT_TYPES } from "@/lib/landing";

// Server-rendered SEO layer for the homepage: real content + crawlable
// links to every comuna/category/profile page. Removed once the client
// app mounts over it (progressive enhancement).
export default function HomeSeo({ talents, comunas, categories }) {
  const featured = talents.slice(0, 18);
  const linkStyle = { display: "inline-block", padding: "6px 12px", borderRadius: 999, background: "#1e1e3a", color: "#c4c4d8", fontSize: 13, textDecoration: "none", border: "1px solid rgba(139,92,246,0.2)" };
  return (
    <div style={{ background: "#12122a", color: "#fff", fontFamily: "'Sora', system-ui, sans-serif" }}>
      {/* Visible loading screen — matches the app, so there's no jarring swap */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
        <div style={{ fontWeight: 800, fontSize: 26 }}>
          <span style={{ color: "#8B5CF6" }}>Tio</span><span style={{ color: "#fff" }}>Johnny</span><span style={{ color: "#6b6b90" }}>.cl</span>
        </div>
        <div className="animate-spin" style={{ width: 28, height: 28, border: "3px solid #8B5CF6", borderTopColor: "transparent", borderRadius: "50%" }} />
        <div style={{ color: "#7878a0", fontSize: 13 }}>Cargando talentos...</div>
      </div>

      {/* SEO content for crawlers — below the fold; the app replaces it all on load */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px 90px" }}>
        <h1 style={{ fontSize: 27, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.2 }}>
          Modelos y Talentos para Eventos en Chile
        </h1>
        <p style={{ color: "#9898b0", fontSize: 15, lineHeight: 1.65, margin: "0 0 22px", maxWidth: 680 }}>
          Directorio de modelos, animadoras y talentos para fiestas privadas, despedidas de soltero y soltera,
          eventos corporativos, desfiles y sesiones fotográficas. Perfiles verificados en todo Chile, con
          contacto directo por WhatsApp.
        </p>

        {comunas.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 10px" }}>Modelos por comuna</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {comunas.map((c) => (
                <a key={c.slug} href={`/modelos/${c.slug}`} style={linkStyle}>{c.name} <span style={{ color: "#7878a0" }}>({c.count})</span></a>
              ))}
            </div>
          </section>
        )}

        {categories.length > 0 && (
          <section style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 10px" }}>Categorías</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {categories.map((c) => (
                <a key={c.slug} href={`/categoria/${c.slug}`} style={linkStyle}>{c.name} <span style={{ color: "#7878a0" }}>({c.count})</span></a>
              ))}
            </div>
          </section>
        )}

        <section style={{ marginBottom: 26 }}>
          <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 10px" }}>Para tu evento</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {Object.entries(EVENT_TYPES).map(([slug, cfg]) => (
              <a key={slug} href={`/eventos/${slug}`} style={linkStyle}>{cfg.name}</a>
            ))}
          </div>
        </section>

        {featured.length > 0 && (
          <section>
            <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: "#8B5CF6", margin: "0 0 12px" }}>Modelos destacadas</h2>
            <TalentCards talents={featured} />
          </section>
        )}
      </div>
    </div>
  );
}
