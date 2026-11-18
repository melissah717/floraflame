import type { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  /*
   * lastModified is only asserted where a real date exists.
   *
   * Every URL used to carry `new Date()` — the build time — which told
   * crawlers the entire site changed on every deploy. Google treats a
   * lastmod that's demonstrably wrong as noise and starts ignoring the
   * field, which costs the signal on the pages where it IS accurate.
   *
   * These pages' copy only changes when someone edits a component, so
   * none of them gets a lastModified — the field is optional, and
   * omitting it is honest where inventing one is not.
   */
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/strains`, changeFrequency: "weekly", priority: 0.8 },
    // Stockists change as the sheet does, so weekly is honest.
    { url: `${BASE_URL}/find-us`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/events`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/learn`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/learn/the-leaf`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-soil`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-farm`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/accessibility`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return staticRoutes;
}
