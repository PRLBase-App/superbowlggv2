import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 38, background: "#131520", color: "white", fontSize: 68, fontWeight: 800, letterSpacing: -3 }}>
      <span style={{ color: "#65b7ff" }}>SB</span>
    </div>,
    size,
  );
}
