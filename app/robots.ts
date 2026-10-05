import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin is already behind auth; this just keeps it out of an
      // index. Each admin route also sets robots: noindex in its metadata,
      // because a disallow alone doesn't stop a discovered URL being listed.
      disallow: "/admin",
    },
    sitemap: "https://floraflame.ca/sitemap.xml",
  };
}
