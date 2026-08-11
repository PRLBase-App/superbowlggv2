import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "android-chrome-192x192.png"));
  const logoDataUri = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#131520 0%,#0d393a 100%)", color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 38, fontWeight: 800, letterSpacing: "-0.05em" }}>
        {/* next/image cannot render inside an ImageResponse. */}
        <img src={logoDataUri} width="84" height="84" alt="" style={{ borderRadius: 18 }} />
        <div style={{ display: "flex" }}>superbowl<span style={{ color: "#4f7dff" }}>.gg</span></div>
      </div>
      <div style={{ marginTop: 54, maxWidth: 900, fontSize: 64, lineHeight: 1.05, fontWeight: 800 }}>The 2026 NFL season lives here.</div>
      <div style={{ marginTop: 24, fontSize: 28, color: "#bfc3d9" }}>News · Predictions · Schedule · Stats · Super Bowl LXI</div>
    </div>,
    size,
  );
}
