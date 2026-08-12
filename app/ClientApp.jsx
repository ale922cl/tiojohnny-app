"use client";

import dynamic from "next/dynamic";

// The existing single-file app relies heavily on browser APIs (window,
// visualViewport, canvas, crypto) and creates the Supabase client at module
// scope. Load it client-only so none of that runs during SSR/prerender.
const TioJohnny = dynamic(() => import("../src/TioJohnny.jsx"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#12122a",
      }}
    >
      <div className="animate-spin" style={{ width: 28, height: 28, border: "3px solid #8B5CF6", borderTopColor: "transparent", borderRadius: "50%" }} />
    </div>
  ),
});

export default function ClientApp() {
  return <TioJohnny />;
}
