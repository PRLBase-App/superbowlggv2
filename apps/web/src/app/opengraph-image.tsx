import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#131520 0%,#0d393a 100%)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 800 }}><span style={{ display: "flex", width: 74, height: 74, borderRadius: 18, alignItems: "center", justifyContent: "center", background: "#3e7dd5" }}>SB</span> SUPERBOWL.GG</div>
      <div style={{ marginTop: 54, maxWidth: 900, fontSize: 64, lineHeight: 1.05, fontWeight: 800 }}>The 2026 NFL season lives here.</div>
      <div style={{ marginTop: 24, fontSize: 28, color: "#bfc3d9" }}>News · Predictions · Schedule · Stats · Super Bowl LXI</div>
    </div>,
    size,
  );
}
