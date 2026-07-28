import type { MetadataRoute } from "next";

// Nav links to /blog, but that route doesn't exist yet (would 404) — add
// it here once app/blog/page.tsx is built.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://floraflame.ca",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
