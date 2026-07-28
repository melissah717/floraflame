import { ImageResponse } from "next/og";

// Edge, not nodejs — see opengraph-image.tsx for why.
export const runtime = "edge";
export const alt = "Flora & Flame — Living Soil Cannabis, Oakland CA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await fetch(
    new URL("./logo-og.png", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const logoSrc = `data:image/png;base64,${Buffer.from(logoBuffer).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1c1915",
          color: "#faf8f4",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={220}
          height={220}
          style={{ objectFit: "contain" }}
        />
        <div
          style={{
            marginTop: 32,
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: -1,
          }}
        >
          Flora &amp; Flame
        </div>
        <div style={{ marginTop: 14, fontSize: 28, color: "#a29886" }}>
          Living Soil Cannabis — Oakland, CA
        </div>
      </div>
    ),
    { ...size }
  );
}
