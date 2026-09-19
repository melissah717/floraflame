import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

const BASE_URL = "https://floraflame.ca";

// /merch is excluded on purpose — it's a thin placeholder page (see its
// own noindex) with nothing unique for a search engine to index yet.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  /*
   * lastModified is only asserted where a real date exists.
   *
   * Every URL used to carry `new Date()` — the build time — which told
   * crawlers the entire site changed on every deploy. Google treats a
   * lastmod that's demonstrably wrong as noise and starts ignoring the
   * field, which costs the signal on the pages where it IS accurate.
   *
   * Pages driven by content get their content's real timestamp. Editorial
   * pages, whose copy only changes when someone edits the component, get
   * no lastModified at all — the field is optional, and omitting it is
   * honest where inventing one is not.
   */
  const newestPost = posts
    .map((p) => p.updatedAt)
    .sort()
    .at(-1);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/strains`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/learn`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/learn/the-leaf`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-soil`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/learn/the-farm`, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${BASE_URL}/learn/the-knowledge`,
      // The index genuinely changes whenever its newest post does.
      ...(newestPost ? { lastModified: new Date(newestPost) } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/learn/the-knowledge/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes];
}
