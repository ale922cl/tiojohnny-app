import { modeloPath } from "@/lib/seo";

const cleanRate = (r) => (r || "").replace(/\s*\/?\s*(hr|hra|hora|h)\b\.?/i, "").trim();

// Responsive grid of talent cards, each linking to its SEO profile page.
export default function TalentCards({ talents }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
      {talents.map((t) => {
        const ph = Array.isArray(t.photos) ? t.photos.find(Boolean) : null;
        const rate = cleanRate(t.rate);
        return (
          <a key={t.id} href={modeloPath(t)} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ borderRadius: 14, overflow: "hidden", background: "#0d0d1a", aspectRatio: "3/4" }}>
              {ph && (
                <img src={ph} alt={`${t.name}${t.location ? ` — modelo en ${t.location}` : ""}`} loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 7 }}>{t.name}</div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginTop: 1 }}>
              {t.location && <span style={{ fontSize: 12, color: "#7878a0" }}>{t.location}</span>}
              {rate && <span style={{ fontSize: 12, color: "#8B5CF6", fontWeight: 600 }}>{rate}</span>}
            </div>
          </a>
        );
      })}
    </div>
  );
}
