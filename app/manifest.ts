import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flora & Flame",
    short_name: "Flora & Flame",
    description:
      "Small-batch, no-till living soil cannabis grown in Oakland, CA.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f4",
    theme_color: "#1c1915",
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
