import TalentCards from "./TalentCards";

// Shared shell for comuna / category landing pages.
export default function LandingGrid({ heading, intro, talents }) {
  return (
    <main style={{ minHeight: "100vh", background: "#12122a", color: "#fff", fontFamily: "'Sora', system-ui, sans-serif" }}>
      <header style={{ padding: "14px 18px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <a href="/" style={{ fontWeight: 800, fontSize: 20, textDecoration: "none" }}>
          <span style={{ color: "#8B5CF6" }}>Tio</span><span style={{ color: "#fff" }}>Johnny</span><span style={{ color: "#6b6b90" }}>.cl</span>
        </a>
      </header>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "22px 16px 90px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px" }}>{heading}</h1>
        <p style={{ color: "#9898b0", fontSize: 15, lineHeight: 1.65, margin: "0 0 22px", maxWidth: 660 }}>{intro}</p>
        <TalentCards talents={talents} />
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <a href="/" style={{ color: "#8B5CF6", fontSize: 14, textDecoration: "none" }}>← Ver todas las modelos en TioJohnny.cl</a>
        </div>
      </div>
    </main>
  );
}
